export type Bounds = { x: number; y: number; width: number; height: number };

export type GridConfig = {
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  rows: number;
  cols: number;
  scoreThreshold: number;
  columnGapRatio?: number;
  rowGapRatio?: number;
  detectedRows?: { topRatio: number; heightRatio: number }[];
};

export type GridCell = {
  row: number;
  col: number;
  bounds: Bounds;
};

export function getGridRowLayout(config: GridConfig, row: number) {
  const rows = Math.max(1, Math.round(config.rows));
  const detected = config.detectedRows?.length === rows ? config.detectedRows[row] : undefined;
  if (detected) return detected;
  const gap = Math.min(0.5 / rows, Math.max(0, config.rowGapRatio ?? 0));
  const heightRatio = (1 - gap * (rows - 1)) / rows;
  return { topRatio: row * (heightRatio + gap), heightRatio };
}

export type GridDebugResult = {
  imageWidth: number;
  imageHeight: number;
  rows: number;
  cols: number;
  gridBounds: Bounds;
  cells: GridCell[];
  debugReport: string;
};

export type CellPreview = {
  row: number;
  col: number;
  bounds: Bounds;
  imageUrl: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseImageFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Failed to parse screenshot image."));
      image.src = typeof reader.result === "string" ? reader.result : "";
    };
    reader.onerror = () => reject(new Error("Failed to read screenshot file."));
    reader.readAsDataURL(file);
  });
}

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load screenshot image."));
    };
    image.src = url;
  });
}

function getGridBoundsFromRatios(imageWidth: number, imageHeight: number, gridConfig: GridConfig): Bounds {
  const x = Math.floor(clamp(gridConfig.xRatio, 0, 1) * imageWidth);
  const y = Math.floor(clamp(gridConfig.yRatio, 0, 1) * imageHeight);
  const width = Math.floor(clamp(gridConfig.widthRatio, 0, 1) * imageWidth);
  const height = Math.floor(clamp(gridConfig.heightRatio, 0, 1) * imageHeight);

  const safeWidth = clamp(width, 1, imageWidth - x);
  const safeHeight = clamp(height, 1, imageHeight - y);

  return { x, y, width: safeWidth, height: safeHeight };
}

function extractCellBounds(
  gridBounds: Bounds,
  row: number,
  col: number,
  rows: number,
  cols: number,
  config: GridConfig,
): Bounds {
  const gapX = gridBounds.width * clamp(config.columnGapRatio ?? 0, 0, 0.5 / cols);
  const cellWidth = (gridBounds.width - gapX * (cols - 1)) / cols;
  const detectedRow = config.detectedRows?.length === rows ? config.detectedRows[row] : undefined;
  const rowLayout = getGridRowLayout(config, row);
  const cellHeight = gridBounds.height * rowLayout.heightRatio;

  const x = Math.floor(gridBounds.x + col * (cellWidth + gapX));
  const y = Math.floor(gridBounds.y + gridBounds.height * rowLayout.topRatio);

  const width = Math.max(8, Math.floor(col === cols - 1 ? gridBounds.x + gridBounds.width - x : cellWidth));
  const height = Math.max(
    8,
    Math.floor(!detectedRow && row === rows - 1 ? gridBounds.y + gridBounds.height - y : cellHeight),
  );

  return { x, y, width, height };
}

export async function debugGridSlicingFromScreenshot({
  file,
  gridConfig,
}: {
  file: File;
  gridConfig: GridConfig;
}): Promise<GridDebugResult> {
  const image = await parseImageFile(file);
  const rows = Math.max(1, Math.round(gridConfig.rows));
  const cols = Math.max(1, Math.round(gridConfig.cols));
  const gridBounds = getGridBoundsFromRatios(image.width, image.height, gridConfig);

  const cells: GridCell[] = [];
  const debugLines: string[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const bounds = extractCellBounds(gridBounds, row, col, rows, cols, gridConfig);
      cells.push({ row, col, bounds });
      debugLines.push(`slot(r${row + 1} c${col + 1}) cell=(${bounds.x},${bounds.y},${bounds.width},${bounds.height})`);
    }
  }

  const debugReport = [
    `grid-debug image=(${image.width}x${image.height}) grid=${rows}x${cols} bounds=(${gridBounds.x},${gridBounds.y},${gridBounds.width},${gridBounds.height})`,
    ...debugLines,
  ].join("\n");

  return {
    imageWidth: image.width,
    imageHeight: image.height,
    rows,
    cols,
    gridBounds,
    cells,
    debugReport,
  };
}

function buildCellPreviews(image: HTMLImageElement, gridDebug: GridDebugResult): CellPreview[] {
  return gridDebug.cells.map((cell) => {
    const canvas = document.createElement("canvas");
    canvas.width = cell.bounds.width;
    canvas.height = cell.bounds.height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to build grid preview image.");
    }

    context.drawImage(
      image,
      cell.bounds.x,
      cell.bounds.y,
      cell.bounds.width,
      cell.bounds.height,
      0,
      0,
      cell.bounds.width,
      cell.bounds.height,
    );

    return {
      row: cell.row,
      col: cell.col,
      bounds: cell.bounds,
      imageUrl: canvas.toDataURL("image/png"),
    };
  });
}

export async function analyzeGridSlicing(file: File, gridConfig: GridConfig) {
  const gridDebug = await debugGridSlicingFromScreenshot({ file, gridConfig });
  const image = await loadImageFromFile(file);
  const cellPreviews = buildCellPreviews(image, gridDebug);
  return { gridDebug, cellPreviews };
}

export async function detectGridFromScreenshot(file: File): Promise<GridConfig | null> {
  const image = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 900 / image.width, 1800 / image.height);
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Unable to read screenshot.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const { detectScreenshotGrid } = await import("./detectScreenshotGrid");
  return detectScreenshotGrid(context.getImageData(0, 0, canvas.width, canvas.height));
}
