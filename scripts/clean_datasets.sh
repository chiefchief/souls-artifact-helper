#!/usr/bin/env bash
set -euo pipefail

rm -rf data/artifacts_dataset data/quantity_dataset data/diamonds_dataset
mkdir -p data/artifacts_dataset data/quantity_dataset data/diamonds_dataset

echo "[ok] datasets cleaned"
