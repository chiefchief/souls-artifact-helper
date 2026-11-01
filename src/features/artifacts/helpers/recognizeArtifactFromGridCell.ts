import { artifactClassifierIds, artifactImageCollections } from "../../../data/artifactImageCollections";
import type * as Ort from "onnxruntime-web";
import type { CellPreview } from "./screenshotGrid";
import {
  ARTIFACT_CONFIDENCE_THRESHOLD,
  ARTIFACT_RETRY_CROPS,
  confirmArtifactPrediction,
  type ArtifactPrediction,
} from "./artifactPrediction";

type ArtifactModelSession = {
  session: Ort.InferenceSession;
  inputName: string;
  outputName: string;
  labels: string[];
};

let ortModulePromise: Promise<typeof Ort | null> | null = null;
let artifactModelSessionPromise: Promise<ArtifactModelSession | null> | null = null;

export type ArtifactCandidate = { artifactId: string; confidence: number };
// Keep scores even when automatic recognition rejects a cell. Weak keys release
// the screenshot data when the review is removed and avoid another model run in the picker.
const candidatesByCell = new WeakMap<CellPreview, ArtifactCandidate[]>();

export async function getArtifactCandidates(cell: CellPreview): Promise<ArtifactCandidate[]> {
  if (!candidatesByCell.has(cell)) await recognizeArtifactFromGridCell(cell);
  return candidatesByCell.get(cell) ?? [];
}

function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  return `${base}${path.replace(/^\//, "")}`;
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(width));
  canvas.height = Math.max(1, Math.floor(height));
  return canvas;
}

function canvasToCHW(canvas: HTMLCanvasElement, size: number, cropRatio = 0) {
  const resized = createCanvas(size, size);
  const ctx = resized.getContext("2d");
  const chw = new Float32Array(3 * size * size);
  if (!ctx) return chw;

  ctx.imageSmoothingEnabled = true;
  const insetX = canvas.width * cropRatio;
  const insetY = canvas.height * cropRatio;
  ctx.drawImage(canvas, insetX, insetY, canvas.width - 2 * insetX, canvas.height - 2 * insetY, 0, 0, size, size);
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
  for (let i = 0; i < logits.length; i += 1) max = Math.max(max, logits[i] ?? -Infinity);
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

async function createOrtSession(ort: typeof Ort, modelUrl: string): Promise<Ort.InferenceSession | null> {
  const providerAttempts: Array<Array<"webgpu" | "wasm">> = [["webgpu", "wasm"], ["wasm"]];
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

export function parseArtifactClassifierLabels(value: unknown): string[] | null {
  const knownIds = new Set(
    artifactImageCollections.flatMap((collection) => collection.images.map((artifact) => artifact.id)),
  );
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !value.every((id) => typeof id === "string" && knownIds.has(id)) ||
    new Set(value).size !== value.length
  )
    return null;
  return value;
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
      let labels = artifactClassifierIds;
      try {
        const response = await fetch(withBase("/models/artifacts/artifact-classifier-labels.json"));
        if (response.ok) {
          const parsed = parseArtifactClassifierLabels(await response.json());
          if (!parsed) return null;
          labels = parsed;
        } else if (response.status !== 404) {
          return null;
        }
      } catch {
        return null;
      }
      return { session, inputName, outputName, labels };
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

export async function recognizeArtifactFromGridCell(cell: CellPreview): Promise<{
  artifactId: string;
  artifactName: string;
  confidence: number;
  cellImageUrl: string;
} | null> {
  const model = await getArtifactModelSession();
  const ort = await getOrtModule();
  if (!model || !ort) return null;

  const artifacts = artifactImageCollections.flatMap((collection) => collection.images);

  try {
    const image = await createImage(cell.imageUrl);
    const canvas = createCanvas(image.width, image.height);
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(image, 0, 0);

    const predict = async (cropRatio = 0): Promise<ArtifactPrediction | null> => {
      const tensor = new ort.Tensor("float32", canvasToCHW(canvas, 128, cropRatio), [1, 3, 128, 128]);
      let out: Ort.Tensor | undefined;
      try {
        const outputs = await model.session.run({ [model.inputName]: tensor });
        out = outputs[model.outputName];
        if (!out?.data) return null;
        const logits = toFloat32(out.data as Float32Array | readonly number[] | ArrayLike<number>);
        if (logits.length !== model.labels.length) return null;
        const probabilities = softmax(logits);
        if (cropRatio === 0) {
          candidatesByCell.set(
            cell,
            model.labels.map((artifactId, index) => ({ artifactId, confidence: probabilities[index] })),
          );
        }
        const best = argmax(probabilities);
        return { index: best.index, confidence: best.value };
      } finally {
        tensor.dispose();
        out?.dispose();
      }
    };

    const original = await predict();
    if (!original) return null;
    let prediction = original;
    if (original.confidence < ARTIFACT_CONFIDENCE_THRESHOLD) {
      const retries: ArtifactPrediction[] = [];
      for (const cropRatio of ARTIFACT_RETRY_CROPS) {
        const retry = await predict(cropRatio);
        if (!retry) break;
        retries.push(retry);
        if (retry.index !== original.index || retry.confidence < 0.8) break;
      }
      prediction = confirmArtifactPrediction(original, retries);
    }
    const { index, confidence } = prediction;
    const artifact = artifacts.find((candidate) => candidate.id === model.labels[index]);
    if (!artifact) return null;

    return {
      artifactId: artifact.id,
      artifactName: artifact.name,
      confidence,
      cellImageUrl: cell.imageUrl,
    };
  } catch {
    return null;
  }
}
