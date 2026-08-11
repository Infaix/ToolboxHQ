import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import RegexTesterClient from "./client";

export const metadata: Metadata = buildToolMetadata("regex-tester");

export default function RegexTesterPage() {
  return <RegexTesterClient />;
}
