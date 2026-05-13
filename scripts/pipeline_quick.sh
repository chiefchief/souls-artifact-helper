#!/usr/bin/env bash
set -euo pipefail

bash scripts/ds_quick.sh
bash scripts/train_quick.sh

echo "[ok] quick pipeline complete"
