import * as ort from "onnxruntime-web";

type LoadedModel = {
  session: ort.InferenceSession;
  labels: string[];
  inputName: string;
  outputName: string;
};

type Classification = {
  artifactId: string;
  confidence: number;
};

let loadedModelPromise: Promise<LoadedModel | null> | null = null;
let modelUnavailable = false;

function argMax(values: Float32Array) {
  let bestIndex = 0;
  let best = Number.NEGATIVE_INFINITY;
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index] ?? Number.NEGATIVE_INFINITY;
    if (value > best) {
      best = value;
      bestIndex = index;
    }
  }
  return bestIndex;
}

function softmax(values: Float32Array) {
  let max = Number.NEGATIVE_INFINITY;
  for (let index = 0; index < values.length; index += 1) {
    max = Math.max(max, values[index] ?? Number.NEGATIVE_INFINITY);
  }

  const exp = new Float32Array(values.length);
  let sum = 0;
  for (let index = 0; index < values.length; index += 1) {
    const next = Math.exp((values[index] ?? 0) - max);
    exp[index] = next;
    sum += next;
  }

  if (sum <= 0) {
    return exp;
  }

  for (let index = 0; index < exp.length; index += 1) {
    exp[index] = exp[index] / sum;
  }

  return exp;
}

function imageDataToTensor(imageData: ImageData) {
  const width = imageData.width;
  const height = imageData.height;
  const data = new Float32Array(3 * width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (y * width + x) * 4;
      const r = (imageData.data[pixelIndex] ?? 0) / 255;
      const g = (imageData.data[pixelIndex + 1] ?? 0) / 255;
      const b = (imageData.data[pixelIndex + 2] ?? 0) / 255;

      const flat = y * width + x;
      data[flat] = (r - 0.5) / 0.5;
      data[width * height + flat] = (g - 0.5) / 0.5;
      data[2 * width * height + flat] = (b - 0.5) / 0.5;
    }
  }

  return new ort.Tensor("float32", data, [1, 3, height, width]);
}

function buildInputImageData(slotCanvas: HTMLCanvasElement) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to create model input context.");
  }

  context.drawImage(slotCanvas, 0, 0, slotCanvas.width, slotCanvas.height, 0, 0, size, size);
  return context.getImageData(0, 0, size, size);
}

async function loadModel() {
  if (modelUnavailable) {
    return null;
  }
  if (loadedModelPromise) {
    return loadedModelPromise;
  }

  loadedModelPromise = (async () => {
    try {
      const labelsResponse = await fetch(`${import.meta.env.BASE_URL}models/artifacts/labels.json`);
      if (!labelsResponse.ok) {
        modelUnavailable = true;
        return null;
      }

      const labels = (await labelsResponse.json()) as string[];
      if (!Array.isArray(labels) || labels.length === 0) {
        modelUnavailable = true;
        return null;
      }

      const modelUrl = `${import.meta.env.BASE_URL}models/artifacts/model.onnx`;
      const session = await ort.InferenceSession.create(modelUrl, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      });

      const inputName = session.inputNames[0];
      const outputName = session.outputNames[0];
      if (!inputName || !outputName) {
        modelUnavailable = true;
        return null;
      }

      return {
        session,
        labels,
        inputName,
        outputName,
      } satisfies LoadedModel;
    } catch {
      modelUnavailable = true;
      return null;
    }
  })();

  return loadedModelPromise;
}

export async function classifySlotWithModel(slotCanvas: HTMLCanvasElement): Promise<Classification | null> {
  const model = await loadModel();
  if (!model) {
    return null;
  }

  const imageData = buildInputImageData(slotCanvas);
  const tensor = imageDataToTensor(imageData);
  const outputs = await model.session.run({ [model.inputName]: tensor });
  const result = outputs[model.outputName];

  if (!result || !(result.data instanceof Float32Array)) {
    return null;
  }

  const probabilities = softmax(result.data);
  const bestIndex = argMax(probabilities);
  const artifactId = model.labels[bestIndex];
  if (!artifactId) {
    return null;
  }

  return {
    artifactId,
    confidence: probabilities[bestIndex] ?? 0,
  };
}
