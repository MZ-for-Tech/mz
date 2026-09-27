import React from "react";
import { STUDY_COMPONENTS } from "@/research/lib/registry/studies";

export type { StudyVisualizationId } from "@/research/lib/registry/studies";
export type VisualizationId = import("./studies").StudyVisualizationId;

export const VISUALIZATION_COMPONENTS: Record<VisualizationId, React.ElementType> = {
  ...STUDY_COMPONENTS,
};
