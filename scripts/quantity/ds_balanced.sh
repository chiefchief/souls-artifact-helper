#!/usr/bin/env bash
set -euo pipefail

.venv/bin/python scripts/quantity/generate_quantity_synthetic_datasets.py \
  --per-class 120
