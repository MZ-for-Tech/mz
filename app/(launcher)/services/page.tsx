import { pageMetadata } from "@/lib/seo";
import ServicesPanel from "./ServicesPanel";

export const metadata = pageMetadata({
  title: "Software, AI & Training Services",
  description:
    "Model Zero builds software, AI and fintech systems, runs data analysis and surveys, and guides digital transformation — then trains your team to run it.",
  path: "/services",
});

export default function ServicesPage() {
  return <ServicesPanel />;
}
