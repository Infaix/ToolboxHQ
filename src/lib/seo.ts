import type { Metadata } from "next";
import { getToolBySlug, toolUrl } from "@/lib/toolRegistry";
import { SITE_URL } from "@/lib/site";

export const siteUrl = SITE_URL;

export function buildToolMetadata(slug: string): Metadata {
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  const path = toolUrl(tool);
  const categoryLabel =
    tool.category === "files" ? "File" : tool.category === "pdf" ? "PDF" : tool.category === "utilities" ? "Utility" : "Developer";

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
      title: `${tool.name} - Free ${categoryLabel} Tool`,
      description: tool.description,
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title: `${tool.name} - Free ${categoryLabel} Tool`,
      description: tool.description,
    },
  };
}
