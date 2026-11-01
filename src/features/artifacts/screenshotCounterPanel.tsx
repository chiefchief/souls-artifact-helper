import { RotateCcw, ScanSearch, SlidersHorizontal, Trash2, Upload, X } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
  type SetStateAction,
} from "react";
import { createPortal } from "react-dom";
import { usePageScrollLock } from "../../lib/usePageScrollLock";
import { artifactImageCollections, type ArtifactImage } from "../../data/artifactImageCollections";
import {
  countArtifactsFromGridCells,
  defaultGridConfig,
  type CounterResult,
  type GridConfig,
} from "./screenshotCounter.v4";
import {
  analyzeGridSlicing,
  detectGridFromScreenshot,
  getGridRowLayout,
  type CellPreview,
} from "./helpers/screenshotGrid";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type DragMode = "move" | "resize-se" | "resize-sw" | "resize-ne" | "resize-nw";
type GridStatus = "idle" | "detecting" | "detected" | "manual";

function detectionCellKey(row: number, col: number) {
  return `${row}-${col}`;
}

function buildCountsFromDetections(detections: CounterResult["detections"], excludedCellKeys: Set<string>) {
  const counts: Record<string, number> = {};
  for (const detection of detections) {
    if (excludedCellKeys.has(detectionCellKey(detection.row, detection.col))) {
      continue;
    }
    counts[detection.artifactId] = (counts[detection.artifactId] ?? 0) + detection.quantity;
  }
  return counts;
}

export function ScreenshotCounterPanel({ onApplyCounts }: { onApplyCounts: (counts: Record<string, number>) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [gridConfig, setGridConfig] = useState<GridConfig>(defaultGridConfig);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CounterResult | null>(null);
  const [sourceCells, setSourceCells] = useState<CellPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [gridStatus, setGridStatus] = useState<GridStatus>("idle");
  usePageScrollLock(isOpen);

  const allArtifacts = useMemo(() => artifactImageCollections.flatMap((collection) => collection.images), []);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    setGridStatus("detecting");
    detectGridFromScreenshot(file).then(
      (detected) => {
        if (cancelled) return;
        if (detected) setGridConfig(detected);
        setGridStatus(detected ? "detected" : "manual");
      },
      () => {
        if (!cancelled) setGridStatus("manual");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [file]);

  useEffect(() => {
    setResult(null);
    setSourceCells([]);
  }, [gridConfig]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  function applySelectedFile(nextFile: File | null) {
    setFile(nextFile);
    setResult(null);
    setSourceCells([]);
    setError(null);
    setGridConfig(defaultGridConfig);
    setGridStatus(nextFile ? "detecting" : "idle");
  }

  async function runCounter() {
    if (!file) {
      return;
    }

    setError(null);
    setIsRunning(true);
    try {
      const { cellPreviews } = await analyzeGridSlicing(file, gridConfig);
      const nextResult = await countArtifactsFromGridCells({
        cells: cellPreviews,
      });
      setSourceCells(cellPreviews);
      setResult(nextResult);
    } catch (counterError) {
      setError(counterError instanceof Error ? counterError.message : "Failed to analyze screenshot.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <section className="mt-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-souls-gold bg-souls-gold px-4 py-2 text-sm font-semibold text-souls-void transition hover:brightness-110"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          <ScanSearch className="size-4" /> Add artifacts from screenshot
        </button>
        <p className="text-xs text-souls-panel">
          Recognition is not 100% accurate. Please verify artifact quantities before applying.
        </p>
      </div>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <ScreenshotCounterModal
            error={error}
            file={file}
            gridConfig={gridConfig}
            gridStatus={gridStatus}
            isRunning={isRunning}
            onAnalyze={runCounter}
            onApplyCounts={(counts) => {
              onApplyCounts(counts);
              applySelectedFile(null);
              setIsOpen(false);
            }}
            onClose={() => setIsOpen(false)}
            onSelectFile={applySelectedFile}
            previewUrl={previewUrl}
            result={result}
            sourceCells={sourceCells}
            setGridConfig={setGridConfig}
            allArtifacts={allArtifacts}
          />,
          document.body,
        )}
    </section>
  );
}

function ScreenshotRecognitionReview({
  result,
  sourceCells,
  allArtifacts,
  excludedCellKeys,
  onToggleCell,
  cols,
}: {
  result: CounterResult;
  sourceCells: CellPreview[];
  allArtifacts: ArtifactImage[];
  excludedCellKeys: Set<string>;
  onToggleCell: (row: number, col: number) => void;
  cols: number;
}) {
  const detections = new Map(result.detections.map((item) => [detectionCellKey(item.row, item.col), item]));
  return (
    <section aria-label="Review recognized artifacts" className="mx-auto w-full max-w-3xl space-y-2">
      {result.detections.length === 0 && <p className="text-sm text-souls-panel">No confident detections.</p>}
      <ul
        className="grid grid-cols-[repeat(var(--mobile-cols),minmax(0,1fr))] gap-2 sm:grid-cols-[repeat(var(--review-cols),minmax(0,1fr))]"
        style={{ "--mobile-cols": Math.min(2, Math.max(1, cols)), "--review-cols": Math.max(1, cols) } as CSSProperties}
      >
        {sourceCells.map((cell) => {
          const key = detectionCellKey(cell.row, cell.col);
          const detection = detections.get(key);
          const artifact = allArtifacts.find((item) => item.id === detection?.artifactId);
          const name = artifact?.name ?? detection?.artifactName ?? "Not recognized";
          const recognizedImage = artifact?.imageUrl ?? detection?.cellImageUrl;
          const isExcluded = excludedCellKeys.has(key);
          const position = `row ${cell.row + 1} column ${cell.col + 1}`;
          return (
            <li
              key={key}
              aria-label={`Review ${position}`}
              title={name}
              className={`min-w-0 rounded border bg-souls-void/40 p-1.5 ${
                isExcluded ? "border-souls-ember/45" : detection ? "border-souls-spirit/20" : "border-souls-gold/50"
              }`}
            >
              <div className={`grid grid-cols-2 gap-1.5 ${isExcluded ? "opacity-40" : ""}`}>
                <img
                  src={cell.imageUrl}
                  alt={`Screenshot ${position}`}
                  className="aspect-square w-full rounded object-contain"
                />
                {recognizedImage ? (
                  <img src={recognizedImage} alt={name} className="aspect-square w-full rounded object-contain" />
                ) : (
                  <div
                    role="img"
                    aria-label="Not recognized"
                    className="grid aspect-square place-items-center rounded border border-dashed border-souls-gold/30 text-lg text-souls-gold"
                  >
                    ?
                  </div>
                )}
              </div>
              <div className="mt-1 flex min-h-8 items-center justify-between gap-1">
                <span className={`pl-1 text-sm font-semibold ${isExcluded ? "text-souls-ember" : "text-souls-gold"}`}>
                  {isExcluded ? "Excluded" : detection ? `Qty: ${detection.quantity}` : "Check"}
                </span>
                {detection && (
                  <button
                    type="button"
                    aria-label={`${isExcluded ? "Restore" : "Exclude"} detection ${position}`}
                    className="grid size-8 shrink-0 place-items-center rounded text-souls-panel transition hover:bg-souls-ember/15 hover:text-souls-ember focus-visible:outline-2 focus-visible:outline-souls-gold"
                    onClick={() => onToggleCell(cell.row, cell.col)}
                  >
                    {isExcluded ? <RotateCcw className="size-3.5" /> : <Trash2 className="size-3.5" />}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ScreenshotCounterModal({
  onClose,
  onSelectFile,
  file,
  previewUrl,
  gridConfig,
  gridStatus,
  setGridConfig,
  onAnalyze,
  onApplyCounts,
  result,
  sourceCells,
  error,
  isRunning,
  allArtifacts,
}: {
  onClose: () => void;
  onSelectFile: (file: File | null) => void;
  file: File | null;
  previewUrl: string | null;
  gridConfig: GridConfig;
  gridStatus: GridStatus;
  setGridConfig: Dispatch<SetStateAction<GridConfig>>;
  onAnalyze: () => Promise<void>;
  onApplyCounts: (counts: Record<string, number>) => void;
  result: CounterResult | null;
  sourceCells: CellPreview[];
  error: string | null;
  isRunning: boolean;
  allArtifacts: ArtifactImage[];
}) {
  const imageWrapRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [excludedCellKeys, setExcludedCellKeys] = useState<Set<string>>(() => new Set());
  const [adjustGrid, setAdjustGrid] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const isBusy = isRunning || gridStatus === "detecting";
  const showGridControls = adjustGrid;
  const isEditorOpen = Boolean(previewUrl);

  useEffect(() => {
    setExcludedCellKeys(new Set());
    if (result && contentRef.current) contentRef.current.scrollTop = 0;
  }, [result]);

  useEffect(() => {
    setAdjustGrid(false);
    setShowOriginal(false);
  }, [file]);

  useEffect(() => {
    if (gridStatus === "manual") setAdjustGrid(true);
  }, [gridStatus]);

  const dragStateRef = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    startGrid: GridConfig;
  } | null>(null);

  function beginDrag(mode: DragMode, event: ReactPointerEvent) {
    if (!imageWrapRef.current || isBusy || !showGridControls) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    dragStateRef.current = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      startGrid: { ...gridConfig },
    };

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dragState = dragStateRef.current;
      const container = imageWrapRef.current;
      if (!dragState || !container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }

      const dxRatio = (moveEvent.clientX - dragState.startX) / rect.width;
      const dyRatio = (moveEvent.clientY - dragState.startY) / rect.height;

      if (dragState.mode === "move") {
        setGridConfig((current) => {
          const nextWidth = current.widthRatio;
          const nextHeight = current.heightRatio;
          return {
            ...current,
            xRatio: clamp(dragState.startGrid.xRatio + dxRatio, 0, 1 - nextWidth),
            yRatio: clamp(dragState.startGrid.yRatio + dyRatio, 0, 1 - nextHeight),
          };
        });
        return;
      }

      setGridConfig((current) => {
        const minSize = 0.04;
        const start = dragState.startGrid;

        if (dragState.mode === "resize-se") {
          return {
            ...current,
            widthRatio: clamp(start.widthRatio + dxRatio, minSize, 1 - start.xRatio),
            heightRatio: clamp(start.heightRatio + dyRatio, minSize, 1 - start.yRatio),
          };
        }

        if (dragState.mode === "resize-sw") {
          const nextX = clamp(start.xRatio + dxRatio, 0, start.xRatio + start.widthRatio - minSize);
          const right = start.xRatio + start.widthRatio;
          return {
            ...current,
            xRatio: nextX,
            widthRatio: clamp(right - nextX, minSize, 1 - nextX),
            heightRatio: clamp(start.heightRatio + dyRatio, minSize, 1 - start.yRatio),
          };
        }

        if (dragState.mode === "resize-ne") {
          const nextY = clamp(start.yRatio + dyRatio, 0, start.yRatio + start.heightRatio - minSize);
          const bottom = start.yRatio + start.heightRatio;
          return {
            ...current,
            yRatio: nextY,
            widthRatio: clamp(start.widthRatio + dxRatio, minSize, 1 - start.xRatio),
            heightRatio: clamp(bottom - nextY, minSize, 1 - nextY),
          };
        }

        const nextX = clamp(start.xRatio + dxRatio, 0, start.xRatio + start.widthRatio - minSize);
        const nextY = clamp(start.yRatio + dyRatio, 0, start.yRatio + start.heightRatio - minSize);
        const right = start.xRatio + start.widthRatio;
        const bottom = start.yRatio + start.heightRatio;
        return {
          ...current,
          xRatio: nextX,
          yRatio: nextY,
          widthRatio: clamp(right - nextX, minSize, 1 - nextX),
          heightRatio: clamp(bottom - nextY, minSize, 1 - nextY),
        };
      });
    };

    const onPointerUp = () => {
      dragStateRef.current = null;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
  }

  function toggleDetectionCell(row: number, col: number) {
    const key = detectionCellKey(row, col);
    setExcludedCellKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const filteredCounts = result ? buildCountsFromDetections(result.detections, excludedCellKeys) : {};

  return (
    <div
      className={
        isEditorOpen
          ? "fixed inset-0 z-50 grid items-start justify-items-center overflow-y-auto bg-black/78 p-3 backdrop-blur-md"
          : "fixed inset-0 z-50 grid items-start justify-items-center overflow-y-auto bg-black/70 px-4 py-[100px] backdrop-blur-md"
      }
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-modal="true"
        aria-labelledby="screenshot-counter-title"
        className={
          isEditorOpen
            ? "mt-0 flex h-[calc(100dvh-1.5rem)] w-[min(1800px,100%)] flex-col overflow-hidden rounded border border-souls-spirit/30 bg-souls-night/95 text-souls-parchment shadow-2xl"
            : "mt-0 flex h-[calc(100dvh-200px)] min-h-[320px] w-full max-w-6xl flex-col overflow-hidden rounded border border-souls-spirit/30 bg-souls-night/95 text-souls-parchment shadow-2xl"
        }
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="shrink-0 border-b border-souls-spirit/20 px-3 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="min-w-0 flex-1 text-base font-bold" id="screenshot-counter-title">
              Add artifacts from screenshot
            </h2>
            <button
              aria-label="Close screenshot modal"
              type="button"
              onClick={onClose}
              className="grid size-9 shrink-0 place-items-center rounded text-souls-panel transition hover:bg-souls-spirit/10 hover:text-souls-gold"
            >
              <X className="size-4.5" />
            </button>
          </div>
          {previewUrl && (
            <div
              role="toolbar"
              aria-label="Screenshot actions"
              className="flex flex-wrap items-center gap-2 pb-1 pt-1.5"
            >
              {previewUrl && (
                <>
                  <button
                    type="button"
                    disabled={isBusy}
                    aria-expanded={showGridControls}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded border border-souls-gold/60 bg-souls-gold/15 px-2.5 text-sm font-semibold text-souls-gold transition hover:bg-souls-gold/25 disabled:opacity-50"
                    onClick={() => setAdjustGrid((current) => !current)}
                  >
                    <SlidersHorizontal className="size-4" />
                    {showGridControls ? "Hide grid controls" : "Adjust grid"}
                  </button>
                  {result && (
                    <button
                      type="button"
                      aria-expanded={showOriginal}
                      className="min-h-9 rounded border border-souls-spirit/25 px-2.5 text-xs text-souls-panel transition hover:border-souls-gold"
                      onClick={() => setShowOriginal((current) => !current)}
                    >
                      {showOriginal ? "Hide full screenshot" : "Show full screenshot"}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isRunning}
                    aria-label="Remove screenshot"
                    title="Remove screenshot"
                    className="inline-flex min-h-9 items-center gap-1.5 rounded border border-souls-spirit/25 px-2.5 text-xs text-souls-panel transition hover:border-souls-ember hover:text-souls-ember disabled:opacity-50"
                    onClick={() => onSelectFile(null)}
                  >
                    <Trash2 className="size-4" />
                    <span className="hidden sm:inline">Remove screenshot</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {result && (
          <div className="shrink-0 border-b border-souls-gold/25 bg-souls-night px-3 py-2">
            <p className="mx-auto flex max-w-3xl items-center justify-center gap-2 text-xs font-semibold text-souls-gold sm:text-sm">
              <span>Screenshot</span>
              <span aria-hidden="true">→</span>
              <span className="sr-only">compared with</span>
              <span>Recognized artifact</span>
            </p>
          </div>
        )}

        <div
          ref={contentRef}
          className={
            previewUrl
              ? "min-h-0 flex-1 overflow-y-auto overscroll-contain p-3"
              : "min-h-0 flex flex-1 flex-col overflow-y-auto overscroll-contain p-4"
          }
        >
          {!previewUrl && (
            <div
              className="mb-0 flex flex-1 flex-col items-center justify-center rounded border border-dashed border-souls-spirit/25 bg-souls-void/30 p-6 transition data-[drag-active=true]:border-souls-gold data-[drag-active=true]:bg-souls-gold/10"
              data-drag-active={isDragActive}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragActive(false);
              }}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragActive(false);
                const droppedFile = event.dataTransfer.files?.[0] ?? null;
                if (droppedFile?.type.startsWith("image/")) {
                  onSelectFile(droppedFile);
                }
              }}
            >
              <div className="mb-4 text-center">
                <p className="text-lg font-semibold text-souls-parchment">Upload Inventory Screenshot</p>
                <p className="mt-1 text-sm text-souls-panel">
                  Drag and drop your screenshot here or choose a file to start grid detection.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-souls-spirit/20 bg-souls-void/65 px-3 py-2 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:text-souls-gold">
                  <Upload className="size-4" />
                  Upload screenshot
                  <input
                    accept="image/*"
                    className="hidden"
                    onClick={(event) => {
                      event.currentTarget.value = "";
                    }}
                    onChange={(event) => onSelectFile(event.target.files?.[0] ?? null)}
                    ref={fileInputRef}
                    type="file"
                  />
                </label>
                <span className="text-xs text-souls-panel">Drag and drop screenshot here</span>
              </div>
            </div>
          )}

          {previewUrl ? (
            <div className="space-y-2">
              {(gridStatus === "detecting" || gridStatus === "manual") && (
                <div aria-live="polite">
                  {gridStatus === "detecting" && <p className="text-xs text-souls-panel">Finding artifact grid...</p>}
                  {gridStatus === "manual" && (
                    <p className="text-xs text-souls-gold">
                      Could not find the grid automatically. Please adjust it to cover complete artifact rows.
                    </p>
                  )}
                </div>
              )}
              {showGridControls && (
                <div className="flex items-end justify-center gap-2 rounded border border-souls-spirit/18 bg-souls-void/45 p-3">
                  <label className="min-w-0 rounded border border-souls-spirit/20 bg-souls-void/45 px-2 py-1.5 text-xs text-souls-panel">
                    <span className="mb-1 block">Rows</span>
                    <select
                      disabled={isBusy}
                      className="w-20 rounded border border-souls-spirit/20 bg-souls-night/80 px-2 py-1 text-sm text-souls-parchment outline-none focus:border-souls-gold"
                      onChange={(event) =>
                        setGridConfig((current) => ({
                          ...current,
                          rows: Math.min(64, Math.max(1, Number(event.target.value) || current.rows)),
                          detectedRows: undefined,
                          rowGapRatio: 0,
                        }))
                      }
                      value={gridConfig.rows}
                    >
                      {Array.from({ length: 64 }).map((_, index) => {
                        const value = index + 1;
                        return (
                          <option key={`rows-${value}`} value={value}>
                            {value}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                  <label className="min-w-0 rounded border border-souls-spirit/20 bg-souls-void/45 px-2 py-1.5 text-xs text-souls-panel">
                    <span className="mb-1 block">Cols</span>
                    <select
                      disabled={isBusy}
                      className="w-20 rounded border border-souls-spirit/20 bg-souls-night/80 px-2 py-1 text-sm text-souls-parchment outline-none focus:border-souls-gold"
                      onChange={(event) =>
                        setGridConfig((current) => ({
                          ...current,
                          cols: Math.min(8, Math.max(1, Number(event.target.value) || current.cols)),
                        }))
                      }
                      value={gridConfig.cols}
                    >
                      {Array.from({ length: 8 }).map((_, index) => {
                        const value = index + 1;
                        return (
                          <option key={`cols-${value}`} value={value}>
                            {value}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                </div>
              )}

              {(!result || showOriginal || showGridControls) && (
                <div>
                  {showGridControls && (
                    <p className="mb-2 text-xs text-souls-panel">Drag the grid to move it. Resize from any corner.</p>
                  )}
                  <div className="flex justify-center overflow-auto rounded border border-souls-spirit/20 bg-black/30 p-2">
                    <div className="inline-block max-h-[62vh]" ref={imageWrapRef} style={{ position: "relative" }}>
                      <img
                        alt="Screenshot preview"
                        className="block max-h-[62vh] w-auto select-none"
                        draggable={false}
                        src={previewUrl}
                      />

                      <div
                        className={`absolute border border-souls-gold/95 bg-souls-gold/12 ${showGridControls && !isBusy ? "cursor-move" : "pointer-events-none"}`}
                        onPointerDown={(event) => beginDrag("move", event)}
                        style={{
                          left: `${gridConfig.xRatio * 100}%`,
                          top: `${gridConfig.yRatio * 100}%`,
                          width: `${gridConfig.widthRatio * 100}%`,
                          height: `${gridConfig.heightRatio * 100}%`,
                          touchAction: "none",
                        }}
                      >
                        <div className="pointer-events-none relative h-full w-full">
                          {Array.from({ length: gridConfig.rows }, (_, row) => {
                            const layout = getGridRowLayout(gridConfig, row);
                            return (
                              <div
                                key={row}
                                className="absolute left-0 grid w-full"
                                style={{
                                  top: `${layout.topRatio * 100}%`,
                                  height: `${layout.heightRatio * 100}%`,
                                  gridTemplateColumns: `repeat(${gridConfig.cols}, minmax(0, 1fr))`,
                                  columnGap: `${clamp(gridConfig.columnGapRatio ?? 0, 0, 0.5 / gridConfig.cols) * 100}%`,
                                }}
                              >
                                {Array.from({ length: gridConfig.cols }, (_, col) => (
                                  <div key={col} className="border border-souls-gold/70" />
                                ))}
                              </div>
                            );
                          })}
                        </div>
                        {showGridControls && (
                          <>
                            <button
                              aria-label="Resize grid from top-left"
                              className="absolute -left-2 -top-2 size-4 cursor-nw-resize rounded-sm border border-souls-void bg-souls-gold"
                              onPointerDown={(event) => beginDrag("resize-nw", event)}
                              type="button"
                            />
                            <button
                              aria-label="Resize grid from top-right"
                              className="absolute -right-2 -top-2 size-4 cursor-ne-resize rounded-sm border border-souls-void bg-souls-gold"
                              onPointerDown={(event) => beginDrag("resize-ne", event)}
                              type="button"
                            />
                            <button
                              aria-label="Resize grid from bottom-left"
                              className="absolute -bottom-2 -left-2 size-4 cursor-sw-resize rounded-sm border border-souls-void bg-souls-gold"
                              onPointerDown={(event) => beginDrag("resize-sw", event)}
                              type="button"
                            />
                            <button
                              aria-label="Resize grid from bottom-right"
                              className="absolute -bottom-2 -right-2 size-4 cursor-se-resize rounded-sm border border-souls-void bg-souls-gold"
                              onPointerDown={(event) => beginDrag("resize-se", event)}
                              type="button"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <p className="rounded border border-souls-ember/40 bg-souls-ember/15 px-3 py-2 text-sm text-souls-parchment">
                  {error}
                </p>
              )}

              {result && (
                <ScreenshotRecognitionReview
                  result={result}
                  sourceCells={sourceCells}
                  allArtifacts={allArtifacts}
                  excludedCellKeys={excludedCellKeys}
                  onToggleCell={toggleDetectionCell}
                  cols={gridConfig.cols}
                />
              )}
            </div>
          ) : null}
        </div>
        {previewUrl && (
          <div className="shrink-0 border-t border-souls-spirit/20 bg-souls-night p-3 sm:px-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                className="inline-flex min-h-10 items-center justify-center rounded border border-souls-gold bg-souls-gold px-4 py-2 text-sm font-semibold text-souls-void transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isBusy}
                onClick={() => void onAnalyze()}
                type="button"
              >
                {isRunning ? "Analyzing..." : "Analyze screenshot"}
              </button>
              {result && (
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded border border-souls-leaf/35 px-4 py-2 text-sm font-medium text-souls-panel transition hover:border-souls-leaf hover:bg-souls-leaf hover:text-souls-void"
                  disabled={isBusy}
                  onClick={() => onApplyCounts(filteredCounts)}
                  type="button"
                >
                  Add detected counts
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
