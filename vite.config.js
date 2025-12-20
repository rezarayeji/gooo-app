import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/gooos-app/", // نام دقیق ریپازیتوری شما در GitHub
});
