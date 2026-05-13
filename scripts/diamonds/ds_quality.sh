#!/usr/bin/env bash
set -euo pipefail

.venv/bin/python scripts/diamonds/generate_diamonds_synthetic_datasets.py \
  --per-class 300
