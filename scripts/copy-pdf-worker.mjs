// Copies the pdf.js worker that react-pdf needs into /public so it is served
// from our own origin. Fails the install if react-pdf ended up with a nested
// pdfjs-dist, because the worker and API versions must match exactly.
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const nested = join(root, "node_modules/react-pdf/node_modules/pdfjs-dist/package.json");
if (existsSync(nested)) {
  const wanted = JSON.parse(readFileSync(join(root, "node_modules/react-pdf/package.json"), "utf8"))
    .dependencies["pdfjs-dist"];
  throw new Error(`react-pdf bundles its own pdfjs-dist; pin "pdfjs-dist": "${wanted}" in package.json`);
}
copyFileSync(
  join(root, "node_modules/pdfjs-dist/build/pdf.worker.min.mjs"),
  join(root, "public/pdf.worker.min.mjs"),
);
console.log("Copied pdf.worker.min.mjs to public/");
