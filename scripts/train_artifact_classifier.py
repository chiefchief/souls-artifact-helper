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
from torch.utils.data import DataLoader, Subset, random_split
from torchvision import datasets, transforms, models


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--data', type=Path, required=True)
    p.add_argument('--out', type=Path, default=Path('public/models/artifacts/artifact-classifier.onnx'))
    p.add_argument('--epochs', type=int, default=8)
    p.add_argument('--batch', type=int, default=64)
    p.add_argument('--model-name', type=str, default='artifact')
    args = p.parse_args()
    if args.epochs <= 0:
        raise SystemExit('--epochs must be > 0')
    if args.batch <= 0:
        raise SystemExit('--batch must be > 0')

    torch.manual_seed(42)

    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    num_workers = 0 if os.name == 'nt' else 4
    local_torch_home = Path('.torch-cache').resolve()
    local_torch_home.mkdir(parents=True, exist_ok=True)
    os.environ['TORCH_HOME'] = str(local_torch_home)

    train_tf = transforms.Compose([
        transforms.Resize((128, 128)),
        transforms.ColorJitter(brightness=0.25, contrast=0.25, saturation=0.2, hue=0.05),
        transforms.RandomAffine(degrees=6, translate=(0.05, 0.05), scale=(0.92, 1.08)),
        transforms.ToTensor(),
    ])
    val_tf = transforms.Compose([
        transforms.Resize((128, 128)),
        transforms.ToTensor(),
    ])

    split_ds = datasets.ImageFolder(args.data)
    n_classes = len(split_ds.classes)
    if n_classes < 2:
        raise SystemExit('Need at least 2 classes')

    n_total = len(split_ds)
    n_val = max(1, int(n_total * 0.15))
    n_train = n_total - n_val
    if n_train <= 0:
        raise SystemExit('Need at least 2 samples to create train/val split')
    train_split, val_split = random_split(
        split_ds,
        [n_train, n_val],
        generator=torch.Generator().manual_seed(42),
    )

    train_ds = datasets.ImageFolder(args.data, transform=train_tf)
    val_ds = datasets.ImageFolder(args.data, transform=val_tf)
    train_subset = Subset(train_ds, train_split.indices)
    val_subset = Subset(val_ds, val_split.indices)

    train_dl = DataLoader(train_subset, batch_size=args.batch, shuffle=True, num_workers=num_workers)
    val_dl = DataLoader(val_subset, batch_size=args.batch, shuffle=False, num_workers=num_workers)
    train_batch_total = len(train_dl)
    val_batch_total = len(val_dl)

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
        f"[train:{args.model_name}] start | device={device} | samples={n_total} | "
        f"classes={n_classes} | train={n_train} | val={n_val} | batch={args.batch} | epochs={args.epochs}",
        flush=True,
    )
    print("=" * 84, flush=True)

    for epoch in range(args.epochs):
        total = 0.0
        total_correct = 0
        total_seen = 0
        epoch_start = time.time()
        print(
            f"\n[train:{args.model_name}] ---- epoch {epoch+1}/{args.epochs} ----",
            flush=True,
        )
        model.train()
        for batch_idx, (x, y) in enumerate(train_dl, start=1):
            x, y = x.to(device), y.to(device)
            opt.zero_grad(set_to_none=True)
            logits = model(x)
            loss = loss_fn(logits, y)
            loss.backward()
            opt.step()
            total += loss.item()
            preds = logits.argmax(dim=1)
            total_correct += (preds == y).sum().item()
            total_seen += y.size(0)

            if (
                batch_idx == 1
                or batch_idx == train_batch_total
                or batch_idx % max(1, train_batch_total // 10) == 0
            ):
                elapsed = time.time() - epoch_start
                avg = total / batch_idx
                eta = (elapsed / batch_idx) * (train_batch_total - batch_idx)
                pct = (batch_idx / train_batch_total) * 100.0
                line = (
                    f"\repoch={epoch+1}/{args.epochs} batch={batch_idx}/{train_batch_total} "
                    f"({pct:5.1f}%) avg_loss={avg:.4f} elapsed={_fmt_sec(elapsed)} eta={_fmt_sec(eta)}"
                )
                print(line, end="", flush=True)

        print()
        epoch_elapsed = time.time() - epoch_start
        train_loss = total / train_batch_total
        train_acc = total_correct / max(1, total_seen)

        model.eval()
        val_loss_total = 0.0
        val_correct = 0
        val_seen = 0
        with torch.no_grad():
            for x, y in val_dl:
                x, y = x.to(device), y.to(device)
                logits = model(x)
                val_loss_total += loss_fn(logits, y).item()
                preds = logits.argmax(dim=1)
                val_correct += (preds == y).sum().item()
                val_seen += y.size(0)
        val_loss = val_loss_total / val_batch_total
        val_acc = val_correct / max(1, val_seen)

        print(
            f"[train:{args.model_name}] epoch={epoch+1}/{args.epochs} "
            f"train_loss={train_loss:.4f} train_acc={train_acc:.4f} "
            f"val_loss={val_loss:.4f} val_acc={val_acc:.4f} time={_fmt_sec(epoch_elapsed)}",
            flush=True,
        )

    model.eval()
    args.out.parent.mkdir(parents=True, exist_ok=True)
    pt_out = args.out.with_suffix('.pt')
    torch.save(model.state_dict(), pt_out)
    print(f"[train:{args.model_name}] checkpoint: {pt_out}", flush=True)
    dummy = torch.randn(1, 3, 128, 128, device=device)
    torch_version = torch.__version__.split('+', maxsplit=1)[0]
    torch_version_parts = torch_version.split('.')
    use_dynamo = tuple(int(x) for x in torch_version_parts[:2]) >= (2, 1)
    try:
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
            dynamo=use_dynamo,
        )
    except Exception:
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
