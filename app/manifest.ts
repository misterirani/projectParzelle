import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Parzelle Eintracht",
    short_name: "Parzelle",
    description:
      "Fanclub-App von Parzelle Eintracht für Kalender und Fotogalerie",
    start_url: "/",
    display: "standalone",
    background_color: "#0f2a4a",
    theme_color: "#0f2a4a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
