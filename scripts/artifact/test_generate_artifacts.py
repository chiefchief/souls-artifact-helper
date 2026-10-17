import tempfile
import unittest
from pathlib import Path
from generate_artifacts_synthetic_datasets import ARTIFACT_TS, parse_artifacts, generate_artifact_dataset


class ArtifactDatasetTests(unittest.TestCase):
    def test_new_classes_and_original_indices(self):
        artifacts = parse_artifacts(ARTIFACT_TS)
        ids = [artifact[1] for artifact in artifacts]
        self.assertEqual(len(ids), 70)
        self.assertEqual(ids[33:35], ["mythic-34", "legendary-01"])
        self.assertEqual(ids[66:], ["legendary-33", "mythic-35", "primal-01", "primal-02"])
        for _, _, _, image_url in artifacts:
            self.assertTrue((Path("public") / image_url.lstrip("/")).is_file())

    def test_stale_folders_are_rejected_before_generation(self):
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder)
            (output / "034_mythic-35").mkdir()
            with self.assertRaisesRegex(RuntimeError, "Unexpected dataset folders"):
                generate_artifact_dataset(parse_artifacts(ARTIFACT_TS), [], [], None, output, 1, 0.7)

    def test_missing_reference_is_not_silently_skipped(self):
        with tempfile.TemporaryDirectory() as folder:
            with self.assertRaises(FileNotFoundError):
                generate_artifact_dataset([(0, "mythic-99", "Missing", "/missing.png")], [], [], None, Path(folder), 1, 0.7)
            self.assertFalse((Path(folder) / "labels.json").exists())


if __name__ == "__main__":
    unittest.main()
