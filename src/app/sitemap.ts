import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.juncture.co.in", lastModified: new Date() },
    { url: "https://www.juncture.co.in/privacy", lastModified: new Date() },
  ];
}