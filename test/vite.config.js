import path from "node:path";
import { fileURLToPath } from "node:url";
import isaaccssPlugin from "../lib/vite/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolvePath = (...segments) => path.resolve(__dirname, ...segments);

/** @type {import("vite").UserConfig} */
export default {
  clearScreen: false,
  root: resolvePath("sample/"),
  base: "",
  build: {
    emptyOutDir: true,
    outDir: "../.dist/vite/",
    assetsDir: "",
    rollupOptions: {
      output: {
        assetFileNames: "[name].[ext]",
        chunkFileNames: "[name].[ext]",
        entryFileNames: "[name].js",
        manualChunks: undefined,
      },
    },
  },
  plugins: [isaaccssPlugin()],
};
