import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import UuidGeneratorClient from "./client";

export const metadata: Metadata = buildToolMetadata("uuid-generator");

export default function UuidGeneratorPage() {
  return <UuidGeneratorClient />;
}
