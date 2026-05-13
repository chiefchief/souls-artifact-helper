Put your exported model files here:

- model.onnx
- labels.json

labels.json must be an array of artifact ids from src/data/artifactImageCollections.ts, e.g.
[
  "mythic-01",
  "mythic-02",
  "legendary-01"
]

Until files are present, app will fallback to template matcher.
