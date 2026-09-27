import React from "react";
import dynamic from "next/dynamic";

export type StudyVisualizationId =
  | "PCARedundancy"
  | "ModelParadox"
  | "BaselineMetrics"
  | "GaussianGate"
  | "ParetoFrontier"
  | "DecisionFramework"
  | "VGGArchitectureExplorer"
  | "LassoPhaseTransition"
  | "WeightHistogramExplorer"
  | "SVDRankExplorer"
  | "ChannelPruningViz"
  | "BloodMNISTExplorer"
  | "ConfusionHeatmap"
  | "PractitionersPlaybook"
  | "TensorSurgeryVisualizer"
  | "InformationTheoryChart"
  | "PruningGradient"
  | "SVDSweep"
  | "HardwareProfile"
  | "SVDImageReconstructor"
  | "InferenceThroughputSimulator"
  | "CompoundingSimulator"
  | "MethodologyHeatmap";

export const STUDY_COMPONENTS: Record<StudyVisualizationId, React.ElementType> = {
  PCARedundancy: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/PCARedundancy")),
  ModelParadox: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/ModelParadox")),
  BaselineMetrics: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/BaselineMetrics")),
  GaussianGate: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/GaussianGate")),
  ParetoFrontier: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/ParetoFrontier")),
  DecisionFramework: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/DecisionFramework")),
  VGGArchitectureExplorer: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/VGGArchitectureExplorer")),
  LassoPhaseTransition: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/LassoPhaseTransition")),
  WeightHistogramExplorer: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/WeightHistogramExplorer")),
  SVDRankExplorer: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/SVDRankExplorer")),
  ChannelPruningViz: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/ChannelPruningViz")),
  BloodMNISTExplorer: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/BloodMNISTExplorer")),
  ConfusionHeatmap: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/ConfusionHeatmap")),
  PractitionersPlaybook: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/PractitionersPlaybook")),
  TensorSurgeryVisualizer: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/TensorSurgeryVisualizer")),
  InformationTheoryChart: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/InformationTheoryChart")),
  PruningGradient: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/PruningGradient")),
  SVDSweep: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/SVDSweep")),
  HardwareProfile: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/HardwareProfile")),
  SVDImageReconstructor: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/SVDImageReconstructor")),
  InferenceThroughputSimulator: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/InferenceThroughputSimulator")),
  CompoundingSimulator: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/CompoundingSimulator")),
  MethodologyHeatmap: dynamic(() => import("@/research/features/studies/applied-stats-in-ai/MethodologyHeatmap")),
};
