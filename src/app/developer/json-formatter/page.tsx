import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import JsonFormatterClient from "./client";

export const metadata: Metadata = buildToolMetadata("json-formatter");

export default function JsonFormatterPage() {
  return <JsonFormatterClient />;
}
