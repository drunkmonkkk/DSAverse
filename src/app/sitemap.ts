import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { topics } from "@/data/curriculum";
import { algorithms } from "@/lib/algorithms";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/roadmap",
    "/visualizer",
    "/practice",
    ...topics.map((t) => `/learn/${t.slug}`),
    ...algorithms.map((a) => `/visualizer/${a.id}`),
  ].map((path) => ({
    url: `${siteUrl()}${path}`,
    changeFrequency: "weekly",
    priority: path ? 0.7 : 1,
  }));
}
