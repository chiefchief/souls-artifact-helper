import { RotateCcw, ScanSearch, Trash2, Upload, X } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
  type SetStateAction,
} from "react";
import { createPortal } from "react-dom";
import {
  artifactImageCollections,
  type ArtifactImage,
} from "../../data/artifactImageCollections";
import {
  countArtifactsFromGridCells,
  defaultGridConfig,
  type CounterResult,
  type GridConfig,
} from "./screenshotCounter.v4";
import { analyzeGridSlicing } from "./helpers/screenshotGrid";

function safeNumber(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type DragMode = "move" | "resize-se" | "resize-sw" | "resize-ne" | "resize-nw";

function detectionCellKey(row: number, col: number) {
  return `${row}-${col}`;
}

function buildCountsFromDetections(
  detections: CounterResult["detections"],
  excludedCellKeys: Set<string>,
) {
  const counts: Record<string, number> = {};
  for (const detection of detections) {
    if (excludedCellKeys.has(detectionCellKey(detection.row, detection.col))) {
      continue;
    }
    counts[detection.artifactId] =
      (counts[detection.artifactId] ?? 0) + detection.quantity;
  }
  return counts;
}

export function ScreenshotCounterPanel({
  onApplyCounts,
}: {
  onApplyCounts: (counts: Record<string, number>) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [gridConfig, setGridConfig] = useState<GridConfig>(defaultGridConfig);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CounterResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const allArtifacts = useMemo(
    () => artifactImageCollections.flatMap((collection) => collection.images),
    [],
  );

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function applySelectedFile(nextFile: File | null) {
    setFile(nextFile);
    setResult(null);
    setError(null);
    setGridConfig(defaultGridConfig);
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
      setResult(nextResult);
    } catch (counterError) {
      setError(
        counterError instanceof Error
          ? counterError.message
          : "Failed to analyze screenshot.",
      );
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
            setGridConfig={setGridConfig}
            allArtifacts={allArtifacts}
          />,
          document.body,
        )}
    </section>
  );
}

function ScreenshotCounterModal({
  onClose,
  onSelectFile,
  file,
  previewUrl,
  gridConfig,
  setGridConfig,
  onAnalyze,
  onApplyCounts,
  result,
  error,
  isRunning,
  allArtifacts,
}: {
  onClose: () => void;
  onSelectFile: (file: File | null) => void;
  file: File | null;
  previewUrl: string | null;
  gridConfig: GridConfig;
  setGridConfig: Dispatch<SetStateAction<GridConfig>>;
  onAnalyze: () => Promise<void>;
  onApplyCounts: (counts: Record<string, number>) => void;
  result: CounterResult | null;
  error: string | null;
  isRunning: boolean;
  allArtifacts: ArtifactImage[];
}) {
  const imageWrapRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [excludedCellKeys, setExcludedCellKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const isEditorOpen = Boolean(previewUrl);

  useEffect(() => {
    setExcludedCellKeys(new Set());
  }, [result]);

  const dragStateRef = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    startGrid: GridConfig;
  } | null>(null);

  function beginDrag(mode: DragMode, event: ReactPointerEvent) {
    if (!imageWrapRef.current) {
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
            xRatio: clamp(
              dragState.startGrid.xRatio + dxRatio,
              0,
              1 - nextWidth,
            ),
            yRatio: clamp(
              dragState.startGrid.yRatio + dyRatio,
              0,
              1 - nextHeight,
            ),
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
            widthRatio: clamp(
              start.widthRatio + dxRatio,
              minSize,
              1 - start.xRatio,
            ),
            heightRatio: clamp(
              start.heightRatio + dyRatio,
              minSize,
              1 - start.yRatio,
            ),
          };
        }

        if (dragState.mode === "resize-sw") {
          const nextX = clamp(
            start.xRatio + dxRatio,
            0,
            start.xRatio + start.widthRatio - minSize,
          );
          const right = start.xRatio + start.widthRatio;
          return {
            ...current,
            xRatio: nextX,
            widthRatio: clamp(right - nextX, minSize, 1 - nextX),
            heightRatio: clamp(
              start.heightRatio + dyRatio,
              minSize,
              1 - start.yRatio,
            ),
          };
        }

        if (dragState.mode === "resize-ne") {
          const nextY = clamp(
            start.yRatio + dyRatio,
            0,
            start.yRatio + start.heightRatio - minSize,
          );
          const bottom = start.yRatio + start.heightRatio;
          return {
            ...current,
            yRatio: nextY,
            widthRatio: clamp(
              start.widthRatio + dxRatio,
              minSize,
              1 - start.xRatio,
            ),
            heightRatio: clamp(bottom - nextY, minSize, 1 - nextY),
          };
        }

        const nextX = clamp(
          start.xRatio + dxRatio,
          0,
          start.xRatio + start.widthRatio - minSize,
        );
        const nextY = clamp(
          start.yRatio + dyRatio,
          0,
          start.yRatio + start.heightRatio - minSize,
        );
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

  const filteredCounts = result
    ? buildCountsFromDetections(result.detections, excludedCellKeys)
    : {};

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
        <div className="border-b border-souls-spirit/20 p-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black" id="screenshot-counter-title">
              Add artifacts from screenshot
            </h2>
            <button
              aria-label="Close screenshot modal"
              className="grid size-9 place-items-center rounded border border-souls-spirit/20 text-souls-panel transition hover:border-souls-gold hover:text-souls-gold"
              onClick={onClose}
              type="button"
            >
              <X className="size-4.5" />
            </button>
          </div>
        </div>

        <div
          className={
            previewUrl
              ? "min-h-0 flex-1 overflow-y-auto p-4"
              : "min-h-0 flex flex-1 flex-col overflow-y-auto p-4"
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
                <p className="text-lg font-semibold text-souls-parchment">
                  Upload Inventory Screenshot
                </p>
                <p className="mt-1 text-sm text-souls-panel">
                  Drag and drop your screenshot here or choose a file to start
                  grid detection.
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
                    onChange={(event) =>
                      onSelectFile(event.target.files?.[0] ?? null)
                    }
                    ref={fileInputRef}
                    type="file"
                  />
                </label>
                <span className="text-xs text-souls-panel">
                  Drag and drop screenshot here
                </span>
              </div>
            </div>
          )}

          {previewUrl ? (
            <div className="space-y-4">
              <div className="flex items-end justify-center gap-2 rounded border border-souls-spirit/18 bg-souls-void/45 p-3">
                <label className="min-w-0 rounded border border-souls-spirit/20 bg-souls-void/45 px-2 py-1.5 text-xs text-souls-panel">
                  <span className="mb-1 block">Rows</span>
                  <select
                    className="w-20 rounded border border-souls-spirit/20 bg-souls-night/80 px-2 py-1 text-sm text-souls-parchment outline-none focus:border-souls-gold"
                    onChange={(event) =>
                      setGridConfig((current) => ({
                        ...current,
                        rows: Math.min(
                          8,
                          Math.max(
                            1,
                            Number(event.target.value) || current.rows,
                          ),
                        ),
                      }))
                    }
                    value={gridConfig.rows}
                  >
                    {Array.from({ length: 8 }).map((_, index) => {
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
                    className="w-20 rounded border border-souls-spirit/20 bg-souls-night/80 px-2 py-1 text-sm text-souls-parchment outline-none focus:border-souls-gold"
                    onChange={(event) =>
                      setGridConfig((current) => ({
                        ...current,
                        cols: Math.min(
                          8,
                          Math.max(
                            1,
                            Number(event.target.value) || current.cols,
                          ),
                        ),
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

              <div className="rounded border border-souls-spirit/18 bg-souls-void/45 p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-center text-xs text-souls-panel md:text-left">
                    Move the grid by dragging the rectangle. Resize it from any
                    corner handle.
                  </p>
                  <button
                    className="inline-flex items-center gap-2 rounded border border-souls-ember/30 bg-souls-void/65 px-2.5 py-1.5 text-xs font-medium text-souls-panel transition hover:border-souls-ember hover:text-souls-ember"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                      onSelectFile(null);
                    }}
                    type="button"
                  >
                    Remove screenshot
                  </button>
                </div>
                <div className="flex justify-center overflow-auto rounded border border-souls-spirit/20 bg-black/30 p-2">
                  <div
                    className="inline-block max-h-[62vh]"
                    ref={imageWrapRef}
                    style={{ position: "relative" }}
                  >
                    <img
                      alt="Screenshot preview"
                      className="block max-h-[62vh] w-auto select-none"
                      draggable={false}
                      src={previewUrl}
                    />

                    <div
                      className="absolute cursor-move border border-souls-gold/95 bg-souls-gold/12"
                      onPointerDown={(event) => beginDrag("move", event)}
                      style={{
                        left: `${gridConfig.xRatio * 100}%`,
                        top: `${gridConfig.yRatio * 100}%`,
                        width: `${gridConfig.widthRatio * 100}%`,
                        height: `${gridConfig.heightRatio * 100}%`,
                        touchAction: "none",
                      }}
                    >
                      <div
                        className="pointer-events-none grid h-full w-full"
                        style={{
                          gridTemplateColumns: `repeat(${gridConfig.cols}, minmax(0, 1fr))`,
                          gridTemplateRows: `repeat(${gridConfig.rows}, minmax(0, 1fr))`,
                        }}
                      >
                        {Array.from({
                          length: gridConfig.rows * gridConfig.cols,
                        }).map((_, index) => {
                          const row = Math.floor(index / gridConfig.cols);
                          const col = index % gridConfig.cols;
                          const showRightBorder = col < gridConfig.cols - 1;
                          const showBottomBorder = row < gridConfig.rows - 1;

                          return (
                            <div
                              className={[
                                showRightBorder ? "border-r" : "",
                                showBottomBorder ? "border-b" : "",
                                "border-souls-gold/70",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              key={index}
                            />
                          );
                        })}
                      </div>
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
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded border border-souls-gold bg-souls-gold px-4 py-2 text-sm font-semibold text-souls-void transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isRunning}
                  onClick={() => void onAnalyze()}
                  type="button"
                >
                  {isRunning ? "Analyzing..." : "Analyze screenshot"}
                </button>
                {result && (
                  <button
                    className="inline-flex min-h-10 items-center justify-center rounded border border-souls-leaf/35 px-4 py-2 text-sm font-medium text-souls-panel transition hover:border-souls-leaf hover:bg-souls-leaf hover:text-souls-void"
                    onClick={() => onApplyCounts(filteredCounts)}
                    type="button"
                  >
                    Add detected counts
                  </button>
                )}
              </div>

              {error && (
                <p className="rounded border border-souls-ember/40 bg-souls-ember/15 px-3 py-2 text-sm text-souls-parchment">
                  {error}
                </p>
              )}

              {result && (
                <div className="rounded border border-souls-spirit/20 bg-souls-void/50 p-3">
                  {Object.entries(result.counts).length === 0 ? (
                    <p className="text-sm text-souls-panel">No confident detections.</p>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-souls-panel">
                          Detected By Grid Cells
                        </p>
                        <div className="overflow-auto">
                          <ul
                            className="grid min-w-[720px] gap-2 text-sm text-souls-parchment"
                            style={{
                              gridTemplateColumns: `repeat(${Math.max(1, gridConfig.cols)}, minmax(0, 1fr))`,
                            }}
                          >
                            {Array.from({
                              length: gridConfig.rows * gridConfig.cols,
                            }).map((_, index) => {
                              const row = Math.floor(index / gridConfig.cols);
                              const col = index % gridConfig.cols;
                              const detection = result.detections.find(
                                (item) => item.row === row && item.col === col,
                              );

                              if (!detection) {
                                return (
                                  <li
                                    className="rounded border border-dashed border-souls-spirit/20 bg-souls-night/25 px-2 py-1.5 text-xs text-souls-panel"
                                    key={`empty-${row}-${col}`}
                                  >
                                    r{row + 1} c{col + 1} — Empty
                                  </li>
                                );
                              }

                              const artifact = allArtifacts.find(
                                (item) => item.id === detection.artifactId,
                              );
                              const name =
                                artifact?.name ?? detection.artifactName;
                              const isExcluded = excludedCellKeys.has(
                                detectionCellKey(detection.row, detection.col),
                              );
                              return (
                                <li
                                  className={`flex items-center gap-2 rounded border px-2 py-1.5 ${
                                    isExcluded
                                      ? "border-souls-ember/45 bg-souls-ember/10 opacity-70"
                                      : "border-souls-spirit/20 bg-souls-night/40"
                                  }`}
                                  key={`${detection.row}-${detection.col}-${detection.artifactId}`}
                                >
                                  {artifact?.imageUrl ? (
                                    <img
                                      alt={name}
                                      className="size-8 rounded object-cover"
                                      src={artifact.imageUrl}
                                    />
                                  ) : (
                                    <div className="size-8 rounded bg-souls-void/70" />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs text-souls-panel">
                                      {name}
                                    </p>
                                    <p className="text-sm font-semibold">
                                      Qty: <span>{detection.quantity}</span>
                                    </p>
                                  </div>
                                  <button
                                    aria-label={
                                      isExcluded
                                        ? "Restore detection"
                                        : "Exclude detection"
                                    }
                                    className={`grid size-7 place-items-center rounded border transition ${
                                      isExcluded
                                        ? "border-souls-leaf/55 bg-souls-leaf/15 text-souls-leaf hover:bg-souls-leaf hover:text-souls-void"
                                        : "border-red-500/65 bg-red-500/15 text-red-300 hover:bg-red-500 hover:text-white"
                                    }`}
                                    onClick={() =>
                                      toggleDetectionCell(
                                        detection.row,
                                        detection.col,
                                      )
                                    }
                                    type="button"
                                  >
                                    {isExcluded ? (
                                      <RotateCcw className="size-3.5" />
                                    ) : (
                                      <Trash2 className="size-3.5" />
                                    )}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
