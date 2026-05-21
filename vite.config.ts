import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production")
  },
  build: {
    target: "es2018",
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, "src/zinsendoktor-check.tsx"),
      name: "ZinsendoktorCheck",
      formats: ["iife"],
      fileName: () => "zinsendoktor-check.js"
    },
    rollupOptions: {
      output: {
        extend: true,
        exports: "named"
      }
    },
    minify: "esbuild"
  }
});
