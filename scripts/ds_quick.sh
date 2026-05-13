#!/usr/bin/env bash
set -euo pipefail

# Quick dataset generation for fast iteration
bash scripts/artifact/ds_quick.sh
bash scripts/quantity/ds_quick.sh
bash scripts/diamonds/ds_quick.sh

echo "[ok] quick datasets generated"
