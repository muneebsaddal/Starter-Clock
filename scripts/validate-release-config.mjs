import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const root = process.cwd();
const easSchema = z.object({
  cli: z.object({ appVersionSource: z.literal("local") }),
  build: z.object({
    development: z.object({ developmentClient: z.literal(true), distribution: z.literal("internal") }),
    "internal-test": z.object({
      distribution: z.literal("internal"),
      android: z.object({ buildType: z.literal("apk") }),
    }),
    production: z.object({
      distribution: z.literal("store"),
      android: z.object({ buildType: z.literal("app-bundle") }),
    }),
  }),
});
const appSchema = z.object({
  expo: z.object({
    version: z.string().min(1),
    icon: z.string().min(1),
    ios: z.object({ bundleIdentifier: z.literal("com.starterclock.app"), buildNumber: z.string().min(1) }),
    android: z.object({
      package: z.literal("com.starterclock.app"),
      versionCode: z.number().int().positive(),
      icon: z.string().min(1),
      adaptiveIcon: z.object({ foregroundImage: z.string(), monochromeImage: z.string(), backgroundColor: z.string() }),
    }),
    plugins: z.array(z.union([z.string(), z.tuple([z.string(), z.record(z.string(), z.unknown())])])),
  }),
});

const eas = easSchema.parse(JSON.parse(await readFile(path.join(root, "eas.json"), "utf8")));
const app = appSchema.parse(JSON.parse(await readFile(path.join(root, "app.json"), "utf8")));
const assetPaths = [
  app.expo.icon,
  app.expo.android.icon,
  app.expo.android.adaptiveIcon.foregroundImage,
  app.expo.android.adaptiveIcon.monochromeImage,
  "./assets/app-assets/notification-icon.png",
  "./assets/app-assets/splash-icon.png",
];
await Promise.all(assetPaths.map((asset) => access(path.resolve(root, asset))));

console.log(`Validated EAS profiles: ${Object.keys(eas.build).join(", ")}.`);
console.log(`Validated ${app.expo.android.package} v${app.expo.version} (${app.expo.android.versionCode}) and ${assetPaths.length} asset references.`);
