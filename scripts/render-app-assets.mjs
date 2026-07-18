import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = process.cwd();
const sourceDir = path.join(root, "assets", "branding");
const outputDir = path.join(root, "assets", "app-assets");
const assets = [
  ["app-icon.svg", "icon.png", 1024, false],
  ["adaptive-foreground.svg", "adaptive-foreground.png", 1024, true],
  ["adaptive-monochrome.svg", "adaptive-monochrome.png", 1024, true],
  ["splash-icon.svg", "splash-icon.png", 1024, true],
  ["notification-icon.svg", "notification-icon.png", 96, true],
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  for (const [source, output, size, transparent] of assets) {
    await page.setViewportSize({ width: size, height: size });
    await page.goto(pathToFileURL(path.join(sourceDir, source)).href);
    await page.screenshot({
      path: path.join(outputDir, output),
      clip: { x: 0, y: 0, width: size, height: size },
      omitBackground: transparent,
    });
  }
} finally {
  await browser.close();
}

console.log(`Rendered ${assets.length} Starter Clock assets to ${path.relative(root, outputDir)}.`);
