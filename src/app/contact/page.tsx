import type { Metadata } from "next";
import ContactClient from "./client";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact the ToolboxHQ team with questions, feedback, bug reports, or feature requests.",
};

export default function ContactPage() {
  return <ContactClient />;
}
