import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "../components/AppHeader";
import { TeamBuilder } from "../features/team-builder/TeamBuilder";

export const Route = createFileRoute("/team-builder")({ component: TeamBuilderPage });

function TeamBuilderPage() {
  return (
    <main className="hero-shell min-h-screen text-souls-parchment py-4">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <AppHeader activePath="/team-builder" />
        <TeamBuilder />
      </div>
    </main>
  );
}
