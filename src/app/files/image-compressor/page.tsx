import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import ImageCompressorClient from "./client";

export const metadata: Metadata = buildToolMetadata("image-compressor");

export default function ImageCompressorPage() {
  return <ImageCompressorClient />;
}
