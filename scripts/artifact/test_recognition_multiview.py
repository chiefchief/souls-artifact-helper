"""Real-image regression: .venv/bin/python scripts/artifact/test_recognition_multiview.py"""
import json
from pathlib import Path
import unittest

import numpy as np
import onnx
from onnx.reference import ReferenceEvaluator
from PIL import Image


ROOT = Path(__file__).resolve().parents[2]


class ArtifactScaleRegression(unittest.TestCase):
    def test_upgraded_guardian_of_the_sage(self):
        # Real inventory tile with +40 text, three diamonds and an equipped badge.
        # The unmodified input scored about 0.245 with the shipped model.
        image = Image.open(Path(__file__).parent / "fixtures/guardian-of-the-sage-upgraded.png").convert("RGB")
        model = ReferenceEvaluator(onnx.load(str(ROOT / "public/models/artifacts/artifact-classifier.onnx")))
        labels = json.loads((ROOT / "public/models/artifacts/artifact-classifier-labels.json").read_text())

        def predict(crop_ratio):
            width, height = image.size
            scaled = image.resize((128, 128), Image.Resampling.BILINEAR, box=(
                crop_ratio * width, crop_ratio * height,
                (1 - crop_ratio) * width, (1 - crop_ratio) * height,
            ))
            pixels = np.asarray(scaled, dtype=np.float32).transpose(2, 0, 1)[None] / 255
            logits = model.run(None, {model.input_names[0]: pixels})[0][0]
            scores = np.exp(logits - logits.max())
            scores /= scores.sum()
            best = scores.argmax()
            return labels[int(best)], float(scores[best])

        artifact, confidence = predict(0)
        self.assertEqual(artifact, "legendary-29")
        if confidence < 0.45:
            for ratio in (0.03, 0.06):
                confirmed, score = predict(ratio)
                self.assertEqual(confirmed, artifact)
                self.assertGreaterEqual(score, 0.8)


if __name__ == "__main__":
    unittest.main()
