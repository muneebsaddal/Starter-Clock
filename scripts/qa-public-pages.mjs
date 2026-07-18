import { createServer } from "node:http";
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const dist = path.join(root, "dist");
const output = path.join(process.env.TEMP ?? root, "starter-clock-t012-qa");
await mkdir(output, { recursive: true });

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname.includes(".") ? url.pathname : `${url.pathname}.html`;
    const requested = path.resolve(dist, `.${pathname}`);
    if (!requested.startsWith(dist)) throw new Error("Invalid path");
    const info = await stat(requested);
    if (!info.isFile()) throw new Error("Not a file");
    const extension = path.extname(requested);
    const contentType = extension === ".html" ? "text/html; charset=utf-8" : extension === ".js" ? "text/javascript; charset=utf-8" : extension === ".ico" ? "image/x-icon" : "application/octet-stream";
    response.writeHead(200, { "content-type": contentType });
    response.end(await readFile(requested));
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Could not start QA server.");
const base = `http://127.0.0.1:${address.port}`;

const browser = await chromium.launch({ headless: true });
const failures = [];
try {
  for (const viewport of [{ name: "desktop", width: 1366, height: 900 }, { name: "mobile", width: 320, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    const consoleProblems = [];
    const failedRequests = [];
    page.on("console", (message) => { if (["warning", "error"].includes(message.type())) consoleProblems.push(`${message.type()}: ${message.text()}`); });
    page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${request.url()}`));
    for (const route of ["privacy", "support"]) {
      await page.goto(`${base}/${route}`, { waitUntil: "networkidle" });
      await page.getByRole("heading", { name: route === "privacy" ? "Privacy" : "Support", exact: true }).waitFor();
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }));
      if (dimensions.document > dimensions.viewport || dimensions.body > dimensions.viewport) failures.push(`${route}/${viewport.name} horizontal overflow: ${JSON.stringify(dimensions)}`);
      const text = await page.locator("body").innerText();
      if (route === "privacy" && (!text.includes("stored locally on your device") || !text.includes("not sent to Starter Clock"))) failures.push("Privacy local-data copy missing.");
      if (route === "support" && (!text.includes("support@starterclock.app") || !text.includes("Restore purchases"))) failures.push("Support contact or restore copy missing.");
      await page.screenshot({ path: path.join(output, `${route}-${viewport.name}.jpg`), type: "jpeg", quality: 55, fullPage: true });
    }
    await page.goto(base, { waitUntil: "networkidle" });
    await page.getByLabel("Public pages").getByText("Privacy", { exact: true }).click();
    await page.waitForURL(`${base}/privacy`);
    if (consoleProblems.length > 0) failures.push(`${viewport.name} console: ${consoleProblems.join(" | ")}`);
    if (failedRequests.length > 0) failures.push(`${viewport.name} failed requests: ${failedRequests.join(" | ")}`);
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

if (failures.length > 0) throw new Error(failures.join("\n"));
console.log(`Rendered Privacy and Support at desktop and 320px mobile with no overflow, console warnings/errors, or failed requests.`);
console.log(`Screenshots: ${output}`);
