import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import FileConverterClient from "./client";

export const metadata: Metadata = buildToolMetadata("file-converter");

export default function FileConverterPage() {
  return <FileConverterClient />;
}
