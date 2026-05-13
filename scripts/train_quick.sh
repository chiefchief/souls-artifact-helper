#!/usr/bin/env bash
set -euo pipefail

# Ensure datasets exist for training.
if [[ ! -d "data/artifacts_dataset" || ! -d "data/quantity_dataset" || ! -d "data/diamonds_dataset" ]]; then
  echo "[info] datasets not found -> generating quick synthetic datasets"
  bash scripts/ds_quick.sh
fi

# Fast training for quick feedback
echo
echo "================================================================================"
echo "[stage] train artifact model"
echo "================================================================================"
.venv/bin/python -u scripts/train_artifact_classifier.py --data data/artifacts_dataset --epochs 1 --batch 16 --model-name artifact

echo
echo "================================================================================"
echo "[stage] train quantity model"
echo "================================================================================"
.venv/bin/python -u scripts/train_quantity_classifier.py --data data/quantity_dataset --epochs 1 --batch 16 --model-name quantity

echo
echo "================================================================================"
echo "[stage] train diamonds model"
echo "================================================================================"
.venv/bin/python -u scripts/train_diamonds_classifier.py --data data/diamonds_dataset --epochs 1 --batch 16 --model-name diamonds

echo "[ok] quick training finished"
