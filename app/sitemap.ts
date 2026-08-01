import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://thcoaching.business",
      lastModified: new Date("2026-08-01"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
