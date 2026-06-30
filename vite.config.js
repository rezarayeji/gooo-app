   import { defineConfig } from "vite";
   import react from "@vitejs/plugin-react";

   export default defineConfig({
     plugins: [react()],
     base: "./", // این برای جلوگیری از خطای آدرس‌دهی عالی است
   });
