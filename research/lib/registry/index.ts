import React from "react";
import { STUDY_COMPONENTS } from "@/research/lib/registry/studies";
import { ESSAY_COMPONENTS } from "@/research/lib/registry/essays";

export type { StudyVisualizationId } from "@/research/lib/registry/studies";
export type { EssayVisualizationId } from "@/research/lib/registry/essays";
export type VisualizationId = import("./studies").StudyVisualizationId | import("./essays").EssayVisualizationId;

export const VISUALIZATION_COMPONENTS: Record<VisualizationId, React.ElementType> = {
  ...STUDY_COMPONENTS,
  ...ESSAY_COMPONENTS,
};
