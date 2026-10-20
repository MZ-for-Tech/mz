import { pageMetadata } from "@/lib/seo";
import StartScreen from "./StartScreen";
import HomeFeatured from "@/components/sections/HomeFeatured";
import MenuShell from "@/components/MenuShell/MenuShell";

export const metadata = pageMetadata({
  title: "Model Zero — Software & AI Company in Cairo",
  description:
    "Model Zero (MZ) builds custom software and AI systems in Cairo, publishes applied research, and trains your team to operate and maintain what we build.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <MenuShell><StartScreen /><div id="featured"><HomeFeatured /></div></MenuShell>
    </>
  );
}
