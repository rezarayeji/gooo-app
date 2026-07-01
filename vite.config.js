import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["assets/icon-192.png", "assets/icon-512.png"],
      manifest: {
        name: "Goo - Interactive Recovery Character",
        short_name: "Goo",
        description: "An interactive recovery character for educational apps.",
        theme_color: "#0b0f1a",
        background_color: "#0b0f1a",
        display: "fullscreen",
        orientation: "portrait",
        start_url: ".",
        scope: ".",
        icons: [
          {
            src: "/assets/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/assets/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],
  base: "./"
});
