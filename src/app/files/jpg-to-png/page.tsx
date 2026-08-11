import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import JpgToPngClient from "./client";

export const metadata: Metadata = buildToolMetadata("jpg-to-png");

export default function JpgToPngPage() {
  return <JpgToPngClient />;
}
