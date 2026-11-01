import type { GridConfig } from "./screenshotGrid";

type Pixels = { width: number; height: number; data: ArrayLike<number> };
type Tile = { x: number; y: number; width: number; height: number };

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function clusters(values: number[], tolerance: number) {
  const groups: number[][] = [];
  for (const value of [...values].sort((a, b) => a - b)) {
    const last = groups[groups.length - 1];
    if (last && value - median(last) <= tolerance) last.push(value);
    else groups.push([value]);
  }
  return groups.map(median);
}

// Work on a small brightness mask. Artifact frames form separate square components
// on the dark inventory panel; the contents of an icon do not need to be known.
function findTiles(image: Pixels): Tile[] {
  const scale = Math.max(1, image.width / 900, image.height / 1800);
  const width = Math.ceil(image.width / scale);
  const height = Math.ceil(image.height / scale);
  const mask = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i =
        (Math.min(image.height - 1, Math.floor(y * scale)) * image.width +
          Math.min(image.width - 1, Math.floor(x * scale))) *
        4;
      mask[y * width + x] =
        image.data[i + 3] > 128 && Math.max(image.data[i], image.data[i + 1], image.data[i + 2]) >= 80 ? 1 : 0;
    }
  }

  const queue = new Int32Array(mask.length);
  const tiles: Tile[] = [];
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start]) continue;
    let head = 0,
      tail = 1;
    queue[0] = start;
    mask[start] = 0;
    let left = width,
      top = height,
      right = 0,
      bottom = 0;
    while (head < tail) {
      const p = queue[head++],
        x = p % width,
        y = Math.floor(p / width);
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
      for (const next of [
        x > 0 ? p - 1 : -1,
        x + 1 < width ? p + 1 : -1,
        y > 0 ? p - width : -1,
        y + 1 < height ? p + width : -1,
      ]) {
        if (next >= 0 && mask[next]) {
          mask[next] = 0;
          queue[tail++] = next;
        }
      }
    }
    const w = right - left + 1,
      h = bottom - top + 1;
    if (w < 18 || w > width * 0.28 || h / w < 0.85 || h / w > 1.15 || tail < w * h * 0.25) continue;
    // A component cut by the screenshot edge is not a complete inventory tile.
    if (left === 0 || top === 0 || right === width - 1 || bottom === height - 1) continue;
    tiles.push({ x: left * scale, y: top * scale, width: w * scale, height: h * scale });
  }
  return tiles;
}

// Stitching can connect frame corners into one large component. Once the
// columns are known, recover rows from the bright frame strips in each column.
function findRowBands(image: Pixels, columns: number[], size: number) {
  const occupied = new Uint8Array(image.height);
  for (let y = 0; y < image.height; y++) {
    let bright = 0,
      total = 0;
    for (const left of columns)
      for (const fraction of [0.03, 0.05, 0.07, 0.93, 0.95, 0.97]) {
        const x = Math.round(left + size * fraction);
        if (x < 0 || x >= image.width) continue;
        const i = (y * image.width + x) * 4;
        if (Math.max(image.data[i], image.data[i + 1], image.data[i + 2]) >= 80) bright++;
        total++;
      }
    occupied[y] = bright >= total * 0.3 && total > 0 ? 1 : 0;
  }
  // Bridge small breaks in a frame, but keep the dark gap between rows.
  for (let y = 0; y < occupied.length;) {
    if (occupied[y]) {
      y++;
      continue;
    }
    const start = y;
    while (y < occupied.length && !occupied[y]) y++;
    if (start > 0 && y < occupied.length && y - start < size * 0.08) occupied.fill(1, start, y);
  }
  const bands: { top: number; height: number }[] = [];
  for (let y = 0; y < occupied.length;) {
    if (!occupied[y]) {
      y++;
      continue;
    }
    const top = y;
    while (y < occupied.length && occupied[y]) y++;
    const height = y - top;
    if (top > 0 && y < image.height && height >= size * 0.65 && height <= size * 1.15) bands.push({ top, height });
  }
  return bands;
}

/** Returns null rather than guessing when repeated, aligned inventory tiles are absent. */
export function detectScreenshotGrid(image: Pixels): GridConfig | null {
  if (image.width < 80 || image.height < 80 || image.data.length < image.width * image.height * 4) return null;
  const tiles = findTiles(image);
  let best: { config: GridConfig; score: number } | null = null;
  for (const seed of tiles) {
    const similar = tiles.filter(
      (t) =>
        Math.abs(t.width - seed.width) < seed.width * 0.12 && Math.abs(t.height - seed.height) < seed.height * 0.12,
    );
    if (similar.length < 5) continue;
    const size = median(similar.map((t) => t.width));
    const xs = clusters(
      similar.map((t) => t.x),
      size * 0.12,
    );
    // Five columns are a property of the SOULS inventory, not of screenshot resolution.
    for (let first = 0; first + 4 < xs.length; first++) {
      const columns = xs.slice(first, first + 5);
      const steps = columns.slice(1).map((x, i) => x - columns[i]);
      const pitchX = median(steps);
      if (pitchX < size * 1.03 || pitchX > size * 1.5 || steps.some((s) => Math.abs(s - pitchX) > size * 0.08))
        continue;
      const componentTiles = similar.filter((t) => columns.some((x) => Math.abs(t.x - x) < size * 0.12));
      const bands = findRowBands(image, columns, size);
      const aligned = [...componentTiles];
      for (const band of bands) {
        // Band boundaries run just inside rounded frame corners. Prefer exact
        // component bounds when present; otherwise retain the measured band.
        const nearby = componentTiles.filter((t) => Math.abs(t.y - band.top) < size * 0.15);
        const top = nearby.length ? median(nearby.map((t) => t.y)) : band.top;
        const height = nearby.length ? median(nearby.map((t) => t.height)) : size;
        for (const x of columns) {
          if (!aligned.some((t) => Math.abs(t.x - x) < size * 0.12 && Math.abs(t.y - top) < size * 0.12)) {
            aligned.push({ x, y: top, width: size, height });
          }
        }
      }
      const ys = clusters(
        aligned.map((t) => t.y),
        size * 0.12,
      );
      // Separate equally-sized UI elements above/below the inventory from its rows.
      for (let start = 0; start < ys.length; start++) {
        let end = start;
        while (end + 1 < ys.length && ys[end + 1] - ys[end] >= size * 0.85 && ys[end + 1] - ys[end] <= size * 1.5)
          end++;
        const rows = end - start + 1;
        if (rows > 64) continue;
        const rowYs = ys.slice(start, end + 1);
        const members = aligned.filter((t) => rowYs.some((y) => Math.abs(t.y - y) < size * 0.12));
        const lastRowCount = members.filter((t) => Math.abs(t.y - rowYs[rows - 1]) < size * 0.12).length;
        // The final row may contain just one artifact. Validate the preceding
        // rows rather than discarding that item for low overall occupancy.
        if (members.length < 5 || (rows > 1 && members.length - lastRowCount < (rows - 1) * 5 * 0.7)) continue;
        const pitchY = rows > 1 ? median(rowYs.slice(1).map((y, i) => y - rowYs[i])) : pitchX;
        const rowHeights = rowYs.map((top, index) =>
          Math.min(
            median(members.filter((t) => Math.abs(t.y - top) < size * 0.12).map((t) => t.height)),
            index + 1 < rowYs.length ? rowYs[index + 1] - top : Infinity,
          ),
        );
        const tileHeight = median(rowHeights);
        const x = columns[0],
          y = rowYs[0];
        const width = columns[4] - x + size,
          height = rowYs[rows - 1] - y + rowHeights[rows - 1];
        if (x + width > image.width || y + height > image.height) continue;
        const score = members.length;
        if (!best || score > best.score)
          best = {
            score,
            config: {
              xRatio: x / image.width,
              yRatio: y / image.height,
              widthRatio: width / image.width,
              heightRatio: height / image.height,
              rows,
              cols: 5,
              scoreThreshold: 0.58,
              columnGapRatio: (pitchX - size) / width,
              rowGapRatio: rows > 1 ? (pitchY - tileHeight) / height : 0,
              detectedRows: rowYs.map((top, index) => ({
                topRatio: (top - y) / height,
                heightRatio: rowHeights[index] / height,
              })),
            },
          };
      }
    }
  }
  return best?.config ?? null;
}
