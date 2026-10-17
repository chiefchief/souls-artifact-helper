Artifact recognition uses these files together:

- `artifact-classifier.onnx` (and its external data file, if any)
- `artifact-classifier-labels.json`: an ordered JSON array of artifact IDs matching model output indices

The training script exports the labels from the generated dataset. Publish the
model and its labels together. The original 67-class model falls back to the
legacy class list when no labels file exists; newly trained models require labels.

Quantity and diamond classifiers are separate and do not use the artifact labels.

## Validation status and troubleshooting — 2026-10-17

Explicit model labels were added alongside support for World Tree Branch and the
two Primal artifacts. This should make artifact-to-name mapping more reliable
when the catalog grows or changes order. It does not itself improve the model's
visual recognition accuracy; learning the new icons requires retraining.

The shipped model was retrained for 8 epochs on the 70-class dataset (8,400
synthetic samples, 120 per class), including World Tree Branch, Primal Staff of
Bloodlord, and Primal Mace of Judgment. The split used 7,140 training and 1,260
validation samples. All 1,260 validation samples were classified correctly.

The exported ONNX model passed structural checks and inference checks for all
three new classes, with output values matching the training checkpoint.
`artifact-classifier-validation.json` records per-class results and file hashes.
These are synthetic-data results; recognition against real game screenshots and
improved real-world accuracy remain unverified.

If recognition later stops working or returns incorrect names, check:

- The deployed ONNX model, any external data file, and
  `artifact-classifier-labels.json` must come from the same training run. The
  current labels file describes the retrained 70-class model. The 67-entry
  fallback list in source code exists only for older models without labels.
- Label order must match training class-folder order. A mismatched order can
  return wrong names even when the class counts match.
- Missing, invalid, or unknown labels and output/label count mismatches can cause
  recognition to return no result. A missing labels file supports only the legacy
  model via the fallback list; it does not enable the new classes.
- Browser or hosting caches may serve an old model with new labels, or the reverse.
  Check the served files together before diagnosing image quality.
- If file versions and labels are correct but predictions are poor, evaluate real
  screenshots, especially Mythic/Primal variants with the same name. Synthetic
  samples alone do not establish real-game accuracy.

Training automatically selects CUDA, Apple MPS, or CPU. Use `--device cpu` to
force CPU training, and `--workers 0` if the environment cannot provide shared
memory for data-loading processes. ONNX export runs on CPU for compatibility.
