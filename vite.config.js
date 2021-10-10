import { defineConfig } from "vite";
import { resolve } from "path";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    watch: {
      include: ["src/lib/**"],
    },
    lib: {
      entry: "src/main.ts",
      name: "prognovel-plugins",
      fileName: (format) => `prognovel-plugins.${format}.js`,
    },
  },
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true,
      },
    }),
  ],
  resolve: {
    alias: {
      $utils: "src/lib/utils",
    },
  },
});
