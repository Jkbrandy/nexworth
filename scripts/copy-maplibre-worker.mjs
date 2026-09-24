// MapLibre GL resolves its worker script relative to its own module's
// import.meta.url at runtime (see maplibre-gl/dist/maplibre-gl-*.mjs,
// defaultWorkerUrl()) — after Next.js/Turbopack bundles the module, that URL
// no longer has a real sibling worker file next to it, so the worker 404s
// ("Worker failed to load"). Serving the worker as a static file and
// pointing maplibre-gl at it via setWorkerUrl() (see merchants-map.tsx)
// sidesteps that. maplibre-gl-worker.mjs itself `import`s maplibre-gl-shared.mjs
// as a sibling (relative to wherever it was loaded from), so that has to be
// served alongside it too, or the worker 404s on its own dependency once
// it's running from /public instead of node_modules. This script keeps both
// static copies in sync with whatever maplibre-gl version is actually
// installed — it reruns on every `npm install` via the postinstall hook in
// package.json.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceDir = join(rootDir, "node_modules/maplibre-gl/dist");
const destDir = join(rootDir, "public");

mkdirSync(destDir, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(join(sourceDir, file), join(destDir, file));
}
console.log("[copy-maplibre-worker] copied maplibre-gl-worker.mjs + maplibre-gl-shared.mjs to public/");
