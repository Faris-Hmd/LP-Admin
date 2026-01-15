import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SPS Admin",
    short_name: "SPS Admin",
    description: "Enterprise Inventory & Analytics Management",
    start_url: "/",
    display: "standalone",
    // Matches your Slate-950 dark theme background
    background_color: "#020617",
    // Matches your Blue-600 primary brand color
    theme_color: "#2563eb",
    icons: [
      {
        src: "/apple-icon", // Ensure this path is correct or use /icon.png
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon", // Ideally a specific 512x512 icon
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable", // Allows Android to crop the icon shape
      },
    ],
  };
}
