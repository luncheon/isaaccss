import isaaccssPlugin from "isaaccss/vite";

/** @type {import("vite").UserConfig} */
export default {
  clearScreen: false,
  logLevel: "warn",
  root: "sample/",
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
  plugins: [isaaccssPlugin({ compress: false })],
};
