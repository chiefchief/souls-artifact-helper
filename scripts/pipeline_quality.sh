#!/usr/bin/env bash
set -euo pipefail

bash scripts/ds_quality.sh
bash scripts/train_quality.sh

echo "[ok] quality pipeline complete"
