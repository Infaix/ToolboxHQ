import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import JsonValidatorClient from "./client";

export const metadata: Metadata = buildToolMetadata("json-validator");

export default function JsonValidatorPage() {
  return <JsonValidatorClient />;
}
