#!/usr/bin/env bash
set -euo pipefail

.venv/bin/python scripts/artifact/generate_artifacts_synthetic_datasets.py \
  --dataset artifact \
  --artifact-per-class 60 \
  --artifact-cell-ratio 0.7
