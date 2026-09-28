import { pageMetadata } from "@/lib/seo";
import { WorkShelf } from "@/components/sections/WorkShelf";

export const metadata = pageMetadata({
  title: "Software Projects and Case Studies",
  description:
    "Explore MZ software projects, client platforms, and proprietary products, including the Nested United digital platform and selected client work.",
  path: "/work",
});

/**
 * Work — every project, on one shelf.
 *
 * This absorbed the old Products tab. Splitting client work from proprietary
 * products implied the studio had shipped client work before it had, and it
 * made one product look like two separate things. One collection, one
 * selection model, one stage.
 */
export default function WorkPanel() {
  return <WorkShelf />;
}
