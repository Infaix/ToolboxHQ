import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import PdfMergerClient from "./client";

export const metadata: Metadata = buildToolMetadata("pdf-merger");

export default function PdfMergerPage() {
  return <PdfMergerClient />;
}
