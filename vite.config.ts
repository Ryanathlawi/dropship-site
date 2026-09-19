import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// served from https://ryanathlawi.github.io/dropship-site/ ; set BASE_PATH=/ for a custom domain
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH ?? "/dropship-site/",
});
