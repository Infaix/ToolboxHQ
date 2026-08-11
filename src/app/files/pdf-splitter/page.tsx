import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import PdfSplitterClient from "./client";

export const metadata: Metadata = buildToolMetadata("pdf-splitter");

export default function PdfSplitterPage() {
  return <PdfSplitterClient />;
}
