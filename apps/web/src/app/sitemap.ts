import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://translatekit.threestack.io";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/signup`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.7 },
  ];
}
