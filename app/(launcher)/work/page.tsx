import type { Metadata } from "next";
import { WorkShelf } from "@/components/sections/WorkShelf";

export const metadata: Metadata = {
  title: "MZ | Work",
  description:
    "Platforms built for institutions that can't afford to guess — proprietary products and client work, on one shelf.",
};

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
