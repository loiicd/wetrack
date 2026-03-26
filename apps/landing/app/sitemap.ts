import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://wetrack.io", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://wetrack.io/docs", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];
}
