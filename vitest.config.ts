import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: [
    { find: /^react-native$/, replacement: fileURLToPath(new URL("./test/mocks/react-native.tsx", import.meta.url)) },
    { find: "@", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
  ] },
  test: {
    include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
    coverage: {
      include: ["src/domain/**/*.ts", "src/application/**/*.ts", "src/infrastructure/db/**/*.ts"],
      exclude: ["src/infrastructure/db/expo-database.ts"],
      reporter: ["text", "json-summary"],
    },
  },
});
