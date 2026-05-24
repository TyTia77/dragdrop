import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "https://tytia77.github.io/dragdrop/", // ← replace with your actual repo name
});
