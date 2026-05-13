import type * as Ort from "onnxruntime-web";
import type { CellPreview } from "./screenshotGrid";

type QuantityModelSession = {
  session: Ort.InferenceSession;
  inputName: string;
  outputName: string;
  classValues: string[];
};

let ortModulePromise: Promise<typeof Ort | null> | null = null;
let quantityModelSessionPromise: Promise<QuantityModelSession | null> | null = null;
let didLogMissingOrt = false;
let didLogMissingModel = false;
let didLogSessionCreateFailure = false;

function debugWarn(message: string, payload?: unknown) {
  if (!import.meta.env.DEV) return;
  if (payload !== undefined) {
    console.warn(message, payload);
    return;
  }
  console.warn(message);
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

function get2dContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  return canvas.getContext("2d", { willReadFrequently: true });
}

function canvasToCHW(canvas: HTMLCanvasElement, size: number) {
  const resized = createCanvas(size, size);
  const ctx = get2dContext(resized);
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
      return await ort.InferenceSession.create(modelUrl, { executionProviders });
    } catch {
      // next provider
    }
  }
  return null;
}

async function getQuantityModelSession() {
  if (!quantityModelSessionPromise) {
    quantityModelSessionPromise = (async () => {
      const ort = await getOrtModule();
      if (!ort) {
        if (!didLogMissingOrt) {
          didLogMissingOrt = true;
          debugWarn("[quantity] ONNX runtime module is unavailable.");
        }
        return null;
      }

      const modelUrl = withBase("/models/artifacts/quantity-classifier.onnx");
      const labelsUrl = withBase("/models/artifacts/quantity-labels.json");
      const exists = await tryFetch(modelUrl);
      if (!exists) {
        if (!didLogMissingModel) {
          didLogMissingModel = true;
          debugWarn("[quantity] Model file is missing or unreachable.", { modelUrl });
        }
        return null;
      }

      const session = await createOrtSession(ort, modelUrl);
      if (!session) {
        if (!didLogSessionCreateFailure) {
          didLogSessionCreateFailure = true;
          debugWarn("[quantity] Failed to create ONNX session.", { modelUrl });
        }
        return null;
      }

      const inputName = session.inputNames[0];
      const outputName = session.outputNames[0];
      if (!inputName || !outputName) return null;

      let classValues: string[] = [];
      try {
        const resp = await fetch(labelsUrl);
        if (resp.ok) {
          const labels = (await resp.json()) as unknown;
          if (Array.isArray(labels) && labels.every((value) => typeof value === "string")) {
            classValues = labels as string[];
          }
        }
      } catch {
        // optional labels file
      }
      if (classValues.length === 0) {
        classValues = Array.from({ length: 24 }, (_v, i) => String(i + 1).padStart(2, "0"));
      }

      return { session, inputName, outputName, classValues };
    })();
  }
  return quantityModelSessionPromise;
}

function mapQuantityLabelToValue(label: string): number | null {
  const normalized = label.trim().toLowerCase();
  if (normalized === "none" || normalized === "equip") return 1;
  const n = Number.parseInt(normalized, 10);
  if (Number.isNaN(n) || n < 1 || n > 24) return null;
  return n;
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

function cropToCanvas(source: CanvasImageSource, bounds: { x: number; y: number; width: number; height: number }) {
  const canvas = createCanvas(bounds.width, bounds.height);
  const context = get2dContext(canvas);
  if (!context) throw new Error("Unable to create 2d context.");
  context.drawImage(source, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);
  return canvas;
}

export async function recognizeQuantityFromGridCell(
  cell: CellPreview,
): Promise<{ value: number; confidence: number; imageUrl: string } | null> {
  const model = await getQuantityModelSession();
  const ort = await getOrtModule();
  if (!model || !ort) {
    debugWarn("[quantity] Recognition skipped because model/session is unavailable.");
    return null;
  }

  try {
    const image = await createImage(cell.imageUrl);
    const slotCanvas = createCanvas(image.width, image.height);
    const slotContext = get2dContext(slotCanvas);
    if (!slotContext) return null;
    slotContext.drawImage(image, 0, 0);

    // Match quantity training flow: right-bottom quarter of the cell.
    const quarter = cropToCanvas(slotCanvas, {
      x: Math.floor(slotCanvas.width / 2),
      y: Math.floor(slotCanvas.height / 2),
      width: Math.max(8, Math.floor(slotCanvas.width / 2)),
      height: Math.max(8, Math.floor(slotCanvas.height / 2)),
    });

    const input = canvasToCHW(quarter, 96);
    const tensor = new ort.Tensor("float32", input, [1, 3, 96, 96]);
    const outputs = await model.session.run({ [model.inputName]: tensor });
    const out = outputs[model.outputName];
    if (!out?.data) return null;
    const logits = toFloat32(out.data as Float32Array | readonly number[] | ArrayLike<number>);
    if (logits.length === 0) return null;

    const probs = softmax(logits);
    const { index, value } = argmax(probs);
    const predictedLabel = model.classValues[index];
    const predictedValue = predictedLabel ? mapQuantityLabelToValue(predictedLabel) : null;
    if (predictedValue == null || value < 0.25) {
      debugWarn("[quantity] Low-confidence or invalid-label prediction rejected.", {
        confidence: value,
        index,
        predictedLabel,
      });
      return null;
    }

    return { value: predictedValue, confidence: value, imageUrl: quarter.toDataURL("image/png") };
  } catch (error) {
    debugWarn("[quantity] Recognition failed with exception.", error);
    return null;
  }
}
