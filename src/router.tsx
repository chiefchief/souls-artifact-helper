import { createHashHistory, createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const basepath = import.meta.env.BASE_URL === "/" ? "/" : import.meta.env.BASE_URL.replace(/\/$/, "");
  const useHashHistory = basepath !== "/";

  if (useHashHistory && typeof window !== "undefined" && !window.location.hash) {
    const routePath = window.location.pathname.startsWith(`${basepath}/`)
      ? window.location.pathname.slice(basepath.length)
      : "";

    if (routePath && routePath !== "/") {
      window.history.replaceState(window.history.state, "", `${basepath}/#${routePath}${window.location.search}`);
    }
  }

  const router = createTanStackRouter({
    routeTree,
    basepath: useHashHistory ? "/" : basepath,
    history: useHashHistory ? createHashHistory() : undefined,
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
