import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import UnitConverterClient from "./client";

export const metadata: Metadata = buildToolMetadata("unit-converter");

export default function UnitConverterPage() {
  return <UnitConverterClient />;
}
