import { createFileRoute } from "@tanstack/react-router";
import { LuckyPuzzlePage } from "../events";

export const Route = createFileRoute("/events/lucky-puzzle")({
  component: LuckyPuzzlePage,
});
