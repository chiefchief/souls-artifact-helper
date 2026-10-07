import { Outlet, createRootRoute } from "@tanstack/react-router";
import { AppFooter } from "../components/AppFooter";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="flex min-h-screen flex-col bg-souls-void">
      <div className="flex-1">
        <Outlet />
      </div>
      <AppFooter />
    </div>
  );
}
