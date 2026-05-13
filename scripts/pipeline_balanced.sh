#!/usr/bin/env bash
set -euo pipefail

bash scripts/ds_balanced.sh
bash scripts/train_balanced.sh

echo "[ok] balanced pipeline complete"
