import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cifra Urbana: Departamento de Investigação",
    short_name: "Cifra Urbana",
    description: "Jogo cooperativo de dedução policial cartoonesco",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0e0b",
    theme_color: "#0f0e0b",
    orientation: "any",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
