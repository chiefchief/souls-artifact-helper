import { artifactImageCollections } from "../../../data/artifactImageCollections";
import type * as Ort from "onnxruntime-web";
import type { CellPreview } from "./screenshotGrid";

type ArtifactModelSession = {
  session: Ort.InferenceSession;
  inputName: string;
  outputName: string;
};

let ortModulePromise: Promise<typeof Ort | null> | null = null;
let artifactModelSessionPromise: Promise<ArtifactModelSession | null> | null =
  null;

function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${path.replace(/^\//, "")}`;
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(width));
  canvas.height = Math.max(1, Math.floor(height));
  return canvas;
}

function canvasToCHW(canvas: HTMLCanvasElement, size: number) {
  const resized = createCanvas(size, size);
  const ctx = resized.getContext("2d");
  const chw = new Float32Array(3 * size * size);
  if (!ctx) return chw;

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(canvas, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  const hw = size * size;
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    chw[p] = (data[i] ?? 0) / 255;
    chw[hw + p] = (data[i + 1] ?? 0) / 255;
    chw[2 * hw + p] = (data[i + 2] ?? 0) / 255;
  }
  return chw;
}

function softmax(logits: Float32Array) {
  let max = -Infinity;
  for (let i = 0; i < logits.length; i += 1)
    max = Math.max(max, logits[i] ?? -Infinity);
  const exps = new Float32Array(logits.length);
  let sum = 0;
  for (let i = 0; i < logits.length; i += 1) {
    const value = Math.exp((logits[i] ?? 0) - max);
    exps[i] = value;
    sum += value;
  }
  if (sum > 0) for (let i = 0; i < exps.length; i += 1) exps[i] /= sum;
  return exps;
}

function argmax(values: Float32Array) {
  let bestIndex = 0;
  let bestValue = values[0] ?? -Infinity;
  for (let i = 1; i < values.length; i += 1) {
    const value = values[i] ?? -Infinity;
    if (value > bestValue) {
      bestValue = value;
      bestIndex = i;
    }
  }
  return { index: bestIndex, value: bestValue };
}

function toFloat32(data: Float32Array | readonly number[] | ArrayLike<number>) {
  return data instanceof Float32Array ? data : Float32Array.from(data);
}

async function tryFetch(url: string) {
  try {
    const head = await fetch(url, { method: "HEAD" });
    if (head.ok) return true;
    const get = await fetch(url, { method: "GET" });
    return get.ok;
  } catch {
    return false;
  }
}

async function getOrtModule() {
  if (!ortModulePromise) {
    ortModulePromise = (async () => {
      try {
        return await import("onnxruntime-web");
      } catch {
        try {
          return await import("onnxruntime-web/webgpu");
        } catch {
          return null;
        }
      }
    })();
  }
  return ortModulePromise;
}

async function createOrtSession(
  ort: typeof Ort,
  modelUrl: string,
): Promise<Ort.InferenceSession | null> {
  const providerAttempts: Array<Array<"webgpu" | "wasm">> = [
    ["webgpu", "wasm"],
    ["wasm"],
  ];
  for (const executionProviders of providerAttempts) {
    try {
      return await ort.InferenceSession.create(modelUrl, {
        executionProviders,
      });
    } catch {
      // next provider
    }
  }
  return null;
}

async function getArtifactModelSession() {
  if (!artifactModelSessionPromise) {
    artifactModelSessionPromise = (async () => {
      const ort = await getOrtModule();
      if (!ort) return null;
      const modelUrl = withBase("/models/artifacts/artifact-classifier.onnx");
      const exists = await tryFetch(modelUrl);
      if (!exists) return null;
      const session = await createOrtSession(ort, modelUrl);
      if (!session) return null;
      const inputName = session.inputNames[0];
      const outputName = session.outputNames[0];
      if (!inputName || !outputName) return null;
      return { session, inputName, outputName };
    })();
  }
  return artifactModelSessionPromise;
}

function createImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    image.src = url;
  });
}

export async function recognizeArtifactFromGridCell(
  cell: CellPreview,
): Promise<{
  artifactId: string;
  artifactName: string;
  confidence: number;
  cellImageUrl: string;
} | null> {
  const model = await getArtifactModelSession();
  const ort = await getOrtModule();
  if (!model || !ort) return null;

  const artifacts = artifactImageCollections.flatMap(
    (collection) => collection.images,
  );

  try {
    const image = await createImage(cell.imageUrl);
    const canvas = createCanvas(image.width, image.height);
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(image, 0, 0);

    const input = canvasToCHW(canvas, 128);
    const tensor = new ort.Tensor("float32", input, [1, 3, 128, 128]);
    const outputs = await model.session.run({ [model.inputName]: tensor });
    const out = outputs[model.outputName];
    if (!out?.data) return null;

    const logits = toFloat32(out.data as Float32Array | readonly number[] | ArrayLike<number>);
    const probs = softmax(logits);
    const { index, value } = argmax(probs);
    const artifact = artifacts[index];
    if (!artifact) return null;

    return {
      artifactId: artifact.id,
      artifactName: artifact.name,
      confidence: value,
      cellImageUrl: cell.imageUrl,
    };
  } catch {
    return null;
  }
}
