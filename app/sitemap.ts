import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://thcoaching.business",
      lastModified: new Date("2026-07-26"),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://thcoaching.business/programme",
      lastModified: new Date("2026-07-29"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
