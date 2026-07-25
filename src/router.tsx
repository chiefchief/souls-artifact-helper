import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const basepath = import.meta.env.BASE_URL === "/" ? "/" : import.meta.env.BASE_URL.replace(/\/$/, "");

  // Preserve old shared hash links while moving the app to browser-history URLs.
  if (typeof window !== "undefined" && window.location.hash.startsWith("#/")) {
    const legacyUrl = new URL(window.location.hash.slice(1), window.location.origin);
    window.history.replaceState(
      window.history.state,
      "",
      `${basepath === "/" ? "" : basepath}${legacyUrl.pathname}${legacyUrl.search}`,
    );
  }

  const router = createTanStackRouter({
    routeTree,
    basepath,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
