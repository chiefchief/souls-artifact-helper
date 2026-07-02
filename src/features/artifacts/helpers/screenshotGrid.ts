export type Bounds = { x: number; y: number; width: number; height: number };

export type GridConfig = {
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  rows: number;
  cols: number;
  scoreThreshold: number;
};

export type GridCell = {
  row: number;
  col: number;
  bounds: Bounds;
};

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

function extractCellBounds(gridBounds: Bounds, row: number, col: number, rows: number, cols: number): Bounds {
  const cellWidth = gridBounds.width / cols;
  const cellHeight = gridBounds.height / rows;

  const x = Math.floor(gridBounds.x + col * cellWidth);
  const y = Math.floor(gridBounds.y + row * cellHeight);

  const width = Math.max(8, Math.floor(col === cols - 1 ? gridBounds.x + gridBounds.width - x : cellWidth));
  const height = Math.max(8, Math.floor(row === rows - 1 ? gridBounds.y + gridBounds.height - y : cellHeight));

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
      const bounds = extractCellBounds(gridBounds, row, col, rows, cols);
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
