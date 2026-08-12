import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import QrCodeGeneratorClient from "./client";

export const metadata: Metadata = buildToolMetadata("qr-code-generator");

export default function QrCodeGeneratorPage() {
  return <QrCodeGeneratorClient />;
}
