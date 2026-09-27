"use client";

import React from "react";
import { VISUALIZATION_COMPONENTS, VisualizationId } from "@/research/lib/registry";

interface VisualizationEngineProps {
  id: VisualizationId;
  config?: Record<string, unknown>;
}

export function VisualizationEngine({ id, config }: VisualizationEngineProps) {
  const Component = VISUALIZATION_COMPONENTS[id] as React.ComponentType<Record<string, unknown>>;

  if (!Component) {
    console.warn(`Visualization with id "${id}" not found in registry.`);
    return null;
  }

  return (
    <div className="w-full">
      <Component {...config} />
    </div>
  );
}
