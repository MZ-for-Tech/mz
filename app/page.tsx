import { pageMetadata } from "@/lib/seo";
import StartScreen from "./StartScreen";
import HomeFeatured from "@/components/sections/HomeFeatured";
import MenuShell from "@/components/MenuShell/MenuShell";

export const metadata = pageMetadata({
  title: "Model Zero — Software & AI Company in Cairo",
  description:
    "Model Zero (MZ) builds software and AI in Cairo, then trains teams to run it. Applied research informs the work.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <StartScreen />
      <MenuShell><div id="featured"><HomeFeatured /></div></MenuShell>
    </>
  );
}
