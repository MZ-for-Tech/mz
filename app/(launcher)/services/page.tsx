import { pageMetadata } from "@/lib/seo";
import ServicesPanel from "./ServicesPanel";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "MZ builds custom software and AI systems, applies research, and helps people understand and operate technology.",
  path: "/services",
});

export default function ServicesPage() {
  return <ServicesPanel />;
}
