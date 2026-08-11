import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/toolRegistry";

export const siteUrl = "https://toolboxhq.com";

export function buildToolMetadata(slug: string): Metadata {
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  const path = `/${tool.category}/${tool.slug}`;

  return {
    title: tool.name,
    description: tool.description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      url: path,
      siteName: "ToolboxHQ",
      title: `${tool.name} - Free ${tool.category === "files" ? "File" : "Developer"} Tool`,
      description: tool.description,
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title: `${tool.name} - Free ${tool.category === "files" ? "File" : "Developer"} Tool`,
      description: tool.description,
    },
  };
}
