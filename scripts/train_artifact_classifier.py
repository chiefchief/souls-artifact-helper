#!/usr/bin/env python3
"""
Train artifact classifier and export ONNX.
Dataset layout:
  data/artifacts_dataset/
    class_000/
    class_001/
    ... (one folder per artifact class, folder order must match app artifacts order)
"""
from pathlib import Path
import argparse
import os
import time
import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--data', type=Path, required=True)
    p.add_argument('--out', type=Path, default=Path('public/models/artifacts/artifact-classifier.onnx'))
    p.add_argument('--epochs', type=int, default=8)
    p.add_argument('--batch', type=int, default=64)
    p.add_argument('--model-name', type=str, default='artifact')
    args = p.parse_args()

    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    local_torch_home = Path('.torch-cache').resolve()
    local_torch_home.mkdir(parents=True, exist_ok=True)
    os.environ['TORCH_HOME'] = str(local_torch_home)

    train_tf = transforms.Compose([
        transforms.Resize((128, 128)),
        transforms.ColorJitter(brightness=0.25, contrast=0.25, saturation=0.2, hue=0.05),
        transforms.RandomAffine(degrees=6, translate=(0.05, 0.05), scale=(0.92, 1.08)),
        transforms.ToTensor(),
    ])

    ds = datasets.ImageFolder(args.data, transform=train_tf)
    n_classes = len(ds.classes)
    if n_classes < 2:
        raise SystemExit('Need at least 2 classes')

    dl = DataLoader(ds, batch_size=args.batch, shuffle=True, num_workers=0)

    try:
        model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
    except Exception:
        model = models.mobilenet_v3_small(weights=None)
    model.classifier[3] = nn.Linear(model.classifier[3].in_features, n_classes)
    model.to(device)
    model.train()

    opt = torch.optim.AdamW(model.parameters(), lr=2e-4)
    loss_fn = nn.CrossEntropyLoss()

    def _fmt_sec(seconds: float) -> str:
        seconds = max(0, int(seconds))
        m, sec = divmod(seconds, 60)
        h, m = divmod(m, 60)
        if h:
            return f"{h:d}:{m:02d}:{sec:02d}"
        return f"{m:02d}:{sec:02d}"

    print("=" * 84, flush=True)
    print(
        f"[train:{args.model_name}] start | device={device} | samples={len(ds)} | "
        f"classes={n_classes} | batch={args.batch} | epochs={args.epochs}",
        flush=True,
    )
    print("=" * 84, flush=True)

    for epoch in range(args.epochs):
        total = 0.0
        epoch_start = time.time()
        batch_total = max(1, len(dl))
        print(
            f"\n[train:{args.model_name}] ---- epoch {epoch+1}/{args.epochs} ----",
            flush=True,
        )
        for batch_idx, (x, y) in enumerate(dl, start=1):
            x, y = x.to(device), y.to(device)
            opt.zero_grad(set_to_none=True)
            logits = model(x)
            loss = loss_fn(logits, y)
            loss.backward()
            opt.step()
            total += loss.item()

            if (
                batch_idx == 1
                or batch_idx == batch_total
                or batch_idx % max(1, batch_total // 10) == 0
            ):
                elapsed = time.time() - epoch_start
                avg = total / batch_idx
                eta = (elapsed / batch_idx) * (batch_total - batch_idx)
                pct = (batch_idx / batch_total) * 100.0
                line = (
                    f"\repoch={epoch+1}/{args.epochs} batch={batch_idx}/{batch_total} "
                    f"({pct:5.1f}%) avg_loss={avg:.4f} elapsed={_fmt_sec(elapsed)} eta={_fmt_sec(eta)}"
                )
                print(line, end="", flush=True)

        print()
        epoch_elapsed = time.time() - epoch_start
        print(
            f"[train:{args.model_name}] epoch={epoch+1}/{args.epochs} "
            f"loss={total/max(1, batch_total):.4f} time={_fmt_sec(epoch_elapsed)}",
            flush=True,
        )

    model.eval()
    args.out.parent.mkdir(parents=True, exist_ok=True)
    dummy = torch.randn(1, 3, 128, 128, device=device)
    try:
        # Prefer the new torch.export-based ONNX exporter.
        torch.onnx.export(
            model,
            dummy,
            str(args.out),
            input_names=['input'],
            output_names=['logits'],
            opset_version=18,
            dynamic_axes=None,
            export_params=True,
            do_constant_folding=True,
            external_data=False,
            dynamo=True,
        )
    except Exception:
        # Fallback for environments where the new exporter is unavailable.
        torch.onnx.export(
            model,
            dummy,
            str(args.out),
            input_names=['input'],
            output_names=['logits'],
            opset_version=18,
            dynamic_axes=None,
            export_params=True,
            do_constant_folding=True,
            external_data=False,
            dynamo=False,
        )
    print(f"[train:{args.model_name}] exported: {args.out}", flush=True)


if __name__ == '__main__':
    main()
