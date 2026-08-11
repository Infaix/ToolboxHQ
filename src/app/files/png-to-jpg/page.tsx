import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import PngToJpgClient from "./client";

export const metadata: Metadata = buildToolMetadata("png-to-jpg");

export default function PngToJpgPage() {
  return <PngToJpgClient />;
}
