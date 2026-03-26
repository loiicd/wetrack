import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://wetrack.dev", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://wetrack.dev/docs", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];
}
