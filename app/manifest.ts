import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Liper Admin",
    short_name: "Liper Admin",
    description: "Liper Inventory & Analytics Management",
    start_url: "/",
    display: "standalone",
    // Matches your Slate-950 dark theme background
    background_color: "#fdfdfd",
    // Matches your Blue-600 primary brand color
    theme_color: "#800020",
    icons: [
      {
        src: "/logo.png", // Ensure this path is correct or use /icon.png
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png", // Ideally a specific 512x512 icon
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable", // Allows Android to crop the icon shape
      },
    ],
  };
}
