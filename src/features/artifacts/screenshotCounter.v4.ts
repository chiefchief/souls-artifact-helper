import type { CellPreview, GridConfig } from "./helpers/screenshotGrid";
import { recognizeArtifactFromGridCell } from "./helpers/recognizeArtifactFromGridCell";
import { recognizeDiamondsFromGridCell } from "./helpers/recognizeDiamondsFromGridCell";
import { recognizeQuantityFromGridCell } from "./helpers/recognizeQuantityFromGridCell";
import { artifactIdToImageUrl } from "#/data/artifactImageCollections";

export type { GridConfig, GridDebugResult } from "./helpers/screenshotGrid";

export type DetectedArtifact = {
  artifactId: string;
  artifactName: string;
  score: number;
  quantity: number;
  col: number;
  row: number;
  cellImageUrl?: string;
};

type CellItem = {
  artifactId: string;
  artifactName: string;
  score: number;
  quantity: number;
  row: number;
  col: number;
  cellImageUrl: string;
};

export type CounterResult = {
  detections: DetectedArtifact[];
  counts: Record<string, number>;
};

export const defaultGridConfig: GridConfig = {
  xRatio: 0,
  yRatio: 0,
  widthRatio: 1,
  heightRatio: 1,
  rows: 4,
  cols: 5,
  scoreThreshold: 0.58,
};

const ARTIFACT_CONFIDENCE_THRESHOLD = 0.45;

type ArtifactDecision =
  | { accepted: false }
  | {
      accepted: true;
      artifactId: string;
      artifactName: string;
      confidence: number;
      rawConfidence: number;
      cellImageUrl?: string;
    };

type QuantityDecision = {
  baseQty: number;
};

type DiamondsDecision = {
  diamondMultiplier: number;
};

function debugLog(message: string, payload?: unknown) {
  if (!import.meta.env.DEV) return;
  if (payload !== undefined) {
    console.log(message, payload);
    return;
  }
  console.log(message);
}

function buildCountsFromDetections(detections: DetectedArtifact[]) {
  const counts: Record<string, number> = {};
  for (const detection of detections) {
    counts[detection.artifactId] = (counts[detection.artifactId] ?? 0) + detection.quantity;
  }
  return counts;
}

function getDiamondMultiplier(diamonds: number): number {
  if (diamonds >= 3) return 4;
  if (diamonds >= 1) return 2;
  return 1;
}

async function identifyArtifact(cell: CellPreview): Promise<ArtifactDecision> {
  const artifact = await recognizeArtifactFromGridCell(cell);
  if (!artifact) {
    return { accepted: false };
  }

  const confidence = Number(artifact.confidence.toFixed(3));
  if (confidence < ARTIFACT_CONFIDENCE_THRESHOLD) {
    return { accepted: false };
  }

  return {
    accepted: true,
    artifactId: artifact.artifactId,
    artifactName: artifact.artifactName,
    confidence,
    rawConfidence: artifact.confidence,
    cellImageUrl: artifact.cellImageUrl,
  };
}

async function identifyQuantity(cell: CellPreview): Promise<QuantityDecision> {
  const quantityPrediction = await recognizeQuantityFromGridCell(cell);
  if (!quantityPrediction) {
    debugLog("[quantity] prediction is null", {
      row: cell.row,
      col: cell.col,
      slotImageUrl: cell.imageUrl,
    });
    return { baseQty: 1 };
  }

  if (quantityPrediction.confidence < 0.72) {
    debugLog("[quantity] low confidence prediction", {
      row: cell.row,
      col: cell.col,
      value: quantityPrediction.value,
      confidence: quantityPrediction.confidence,
      slotImageUrl: cell.imageUrl,
      roiImageUrl: quantityPrediction.imageUrl,
    });
  }

  return { baseQty: quantityPrediction.value };
}

type IdentifyDiamondsProps = {
  cell: CellPreview;
  artifactId: string;
};

async function identifyDiamonds({ cell, artifactId }: IdentifyDiamondsProps): Promise<DiamondsDecision> {
  const isMythicArtifact = artifactId.startsWith("mythic-");
  if (isMythicArtifact) {
    return { diamondMultiplier: 1 };
  }

  const diamondsPrediction = await recognizeDiamondsFromGridCell(cell);
  if (!diamondsPrediction) {
    debugLog("[diamonds] prediction is null", {
      row: cell.row,
      col: cell.col,
      artifactId,
      slotImageUrl: cell.imageUrl,
    });
    return { diamondMultiplier: 1 };
  }

  if (diamondsPrediction.confidence < 0.72) {
    debugLog("[diamonds] low confidence prediction", {
      row: cell.row,
      col: cell.col,
      artifactId,
      value: diamondsPrediction.value,
      confidence: diamondsPrediction.confidence,
      slotImageUrl: cell.imageUrl,
      roiImageUrl: diamondsPrediction.imageUrl,
    });
  }
  const diamondMultiplier = getDiamondMultiplier(diamondsPrediction.value);

  return { diamondMultiplier };
}

async function processCell({ cell }: { cell: CellPreview }): Promise<CellItem | undefined> {
  const artifact = await identifyArtifact(cell);
  if (!artifact.accepted) {
    return;
  }

  const { baseQty } = await identifyQuantity(cell);
  const { diamondMultiplier } = await identifyDiamonds({ cell, artifactId: artifact.artifactId });
  const quantity = baseQty * diamondMultiplier;

  return {
    artifactId: artifact.artifactId,
    artifactName: artifact.artifactName,
    score: artifact.confidence,
    quantity,
    row: cell.row,
    col: cell.col,
    cellImageUrl: artifactIdToImageUrl[artifact.artifactId] ?? artifact.cellImageUrl,
  };
}

export async function countArtifactsFromGridCells({ cells }: { cells: CellPreview[] }): Promise<CounterResult> {
  const detections: DetectedArtifact[] = [];

  for (const cell of cells) {
    const artifact = await processCell({ cell });
    if (artifact) {
      detections.push(artifact);
    }
  }

  const counts = buildCountsFromDetections(detections);

  return { detections, counts };
}
