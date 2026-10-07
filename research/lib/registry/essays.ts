import React from 'react';
import dynamic from 'next/dynamic';

export type EssayVisualizationId =
  | 'R2InflationDemo'
  | 'DoubleGoodhartFlow'
  | 'BenchmaxxingLeaderboard'
  | 'L0Visuals';

export const ESSAY_COMPONENTS: Record<EssayVisualizationId, React.ElementType> = {
  R2InflationDemo: dynamic(() => import('@/research/features/essays/institutional-machine/R2InflationDemo')),
  DoubleGoodhartFlow: dynamic(() => import('@/research/features/essays/institutional-machine/DoubleGoodhartFlow')),
  BenchmaxxingLeaderboard: dynamic(() => import('@/research/features/essays/institutional-machine/BenchmaxxingLeaderboard')),
  L0Visuals: dynamic(() => import('@/research/features/essays/l0-story/L0Visuals')),
};
