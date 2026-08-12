import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import ImageResizerClient from "./client";

export const metadata: Metadata = buildToolMetadata("image-resizer");

export default function ImageResizerPage() {
  return <ImageResizerClient />;
}
