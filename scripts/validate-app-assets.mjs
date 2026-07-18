import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = process.cwd();
const dir = path.join(root, "assets", "app-assets");
const expected = [
  ["icon.png", 1024, false],
  ["adaptive-foreground.png", 1024, true],
  ["adaptive-monochrome.png", 1024, true],
  ["splash-icon.png", 1024, true],
  ["notification-icon.png", 96, true],
];

for (const [name, expectedSize] of expected) {
  const png = await readFile(path.join(dir, name));
  if (png.toString("ascii", 1, 4) !== "PNG") throw new Error(`${name} is not a PNG.`);
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (width !== expectedSize || height !== expectedSize) throw new Error(`${name} must be ${expectedSize}x${expectedSize}, got ${width}x${height}.`);
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  for (const [name, , transparent] of expected) {
    await page.goto(pathToFileURL(path.join(dir, name)).href);
    const pixels = await page.evaluate(() => {
      const image = document.querySelector("img");
      if (!(image instanceof HTMLImageElement)) throw new Error("PNG did not render as an image.");
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Canvas context unavailable.");
      context.drawImage(image, 0, 0);
      const corner = context.getImageData(0, 0, 1, 1).data;
      const center = context.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data;
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let minX = canvas.width, minY = canvas.height, maxX = -1, maxY = -1, allVisiblePixelsWhite = true;
      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          const offset = (y * canvas.width + x) * 4;
          if (data[offset + 3] > 0) {
            minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
            if (data[offset] !== 255 || data[offset + 1] !== 255 || data[offset + 2] !== 255) allVisiblePixelsWhite = false;
          }
        }
      }
      return { corner: [...corner], centerAlpha: center[3], bounds: { minX, minY, maxX, maxY }, allVisiblePixelsWhite };
    });
    if (transparent && pixels.corner[3] !== 0) throw new Error(`${name} must have transparent corners.`);
    if (!transparent && pixels.corner[3] !== 255) throw new Error(`${name} must be opaque and full bleed.`);
    if (pixels.centerAlpha === 0) throw new Error(`${name} has no visible center mark.`);
    if (name === "icon.png" && pixels.corner.slice(0, 3).join(",") !== "247,242,233") throw new Error("icon.png must use the warm-paper full-bleed background.");
    if (name === "notification-icon.png" && !pixels.allVisiblePixelsWhite) throw new Error("notification-icon.png must contain only white visible pixels.");
    if (name.startsWith("adaptive-") && (pixels.bounds.minX < 150 || pixels.bounds.minY < 150 || pixels.bounds.maxX > 874 || pixels.bounds.maxY > 874)) throw new Error(`${name} exceeds the representative adaptive-icon safe area.`);
  }
} finally {
  await browser.close();
}

console.log("Validated dimensions, opacity, and transparent corners for all Starter Clock assets.");
