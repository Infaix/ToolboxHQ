import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import Base64Client from "./client";

export const metadata: Metadata = buildToolMetadata("base64");

export default function Base64Page() {
  return <Base64Client />;
}
