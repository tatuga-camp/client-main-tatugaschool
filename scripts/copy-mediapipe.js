import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MediaPipe ships its WASM runtime inside the npm package. Serve it locally so
// webcam processing never depends on Google's CDN (privacy invariant).
const src = path.join(
  __dirname,
  "../node_modules/@mediapipe/tasks-vision/wasm",
);
const dest = path.join(__dirname, "../public/assets/mediapipe/wasm");

try {
  console.log("⏳ Copying MediaPipe WASM assets...");
  fs.cpSync(src, dest, { recursive: true, force: true });
  console.log("✅ MediaPipe WASM assets copied successfully!");
} catch (err) {
  console.error("❌ Error copying MediaPipe assets:", err);
  process.exit(1);
}
