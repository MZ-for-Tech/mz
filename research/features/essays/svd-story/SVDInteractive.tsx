'use client';

import { useState } from 'react';
import ResearchFigure, { ResearchFigurePanel } from '@/research/components/ResearchFigure';
import CompositionSequence from '@/research/features/essays/svd-story/CompositionSequence';
import DecompositionGallery from '@/research/features/essays/svd-story/DecompositionGallery';
import SVDVectorPipeline from '@/research/features/essays/svd-story/SVDVectorPipeline';
import SVDGeometry from '@/research/features/essays/svd-story/SVDGeometry';
import SVDProofJourney from '@/research/features/essays/svd-story/SVDProofJourney';
import RankOneLayerExplorer from '@/research/features/essays/svd-story/RankOneLayerExplorer';
import LowRankReconstructionExplorer from '@/research/features/essays/svd-story/LowRankReconstructionExplorer';
import SingularSpectrumExplorer from '@/research/features/essays/svd-story/SingularSpectrumExplorer';
import PCAProjectionExplorer from '@/research/features/essays/svd-story/PCAProjectionExplorer';
import SVDImageCompressionExplorer from '@/research/features/essays/svd-story/SVDImageCompressionExplorer';
import NeuralNetworkSVDExplorer from '@/research/features/essays/svd-story/NeuralNetworkSVDExplorer';
import SVDConceptMap from '@/research/features/essays/svd-story/SVDConceptMap';

// The interactive JSON has component-specific shapes validated at each switch case.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;
type Props = { item: { id: string; type: string; title: string; instruction?: string; data: Record<string, unknown> }; locale: 'en' | 'ar'; ui: AnyRecord; figureNumber: number };

export default function SVDInteractive({ item, locale, ui, figureNumber }: Props) {
  const d = item.data as AnyRecord; const rtl = locale === 'ar';
  const [selected, setSelected] = useState(0);
  const title = item.title || item.id;
  const instruction = item.instruction;
  const content = (() => {
    switch (item.type) {
      case 'matrix-composition': {
        return <CompositionSequence matrices={{ A: d.A, B: d.B, C: d.C }} initialVector={d.x || [1, 1]} locale={locale} />;
      }
      case 'decomposition-gallery': {
        return <DecompositionGallery items={d.items || []} locale={locale} ui={ui} />;
      }
      case 'svd-factor-explorer': return <SVDVectorPipeline U={d.U} Sigma={d.Sigma} Vt={d.Vt} initialVector={d.x || [1, 0]} locale={locale} />;
      case 'svd-geometry': return <SVDGeometry U={d.U} Sigma={d.Sigma} Vt={d.Vt} locale={locale} stage={selected} onStageChange={setSelected} />;
      case 'proof-map': return <SVDProofJourney steps={d.steps || []} locale={locale} stage={selected} onStageChange={setSelected} />;
      case 'rank1-layers': return <RankOneLayerExplorer original={d.original} components={d.components || []} singularValues={d.singularValues || []} locale={locale} />;
      case 'low-rank-reconstruction': return <LowRankReconstructionExplorer original={d.original} reconstructions={d.reconstructions || []} locale={locale} />;
      case 'singular-spectrum': return <SingularSpectrumExplorer singularValues={d.singularValues || []} locale={locale} />;
      case 'pca-projection': return <PCAProjectionExplorer points={d.points || []} pc1={d.pc1 || [1, 0]} explainedVariance={d.explainedVariance || []} locale={locale} />;
      case 'image-svd': return <SVDImageCompressionExplorer original={d.original || []} reconstructions={d.reconstructions || {}} ranks={d.ranks || []} singularValues={d.singularValues || []} energy={d.energy || []} size={d.size || []} locale={locale} />;
      case 'nn-svd': return <NeuralNetworkSVDExplorer m={d.m} n={d.n} defaultRank={d.defaultRank} maxRank={d.maxRank} originalParams={d.originalParams} locale={locale} />;
      case 'concept-map': return <SVDConceptMap nodes={d.nodes || []} edges={d.edges || []} locale={locale} conceptTexts={ui.conceptTexts} />;
      default: return <p>{rtl ? 'هذا التصور غير متاح.' : 'This visualization is unavailable.'}</p>;
    }
  })();
  return (
    <ResearchFigure
      number={figureNumber}
      title={title}
      caption={instruction}
      locale={locale}
      className="svd-research-figure"
      dataInteractive={item.id}
    >
      <ResearchFigurePanel>
        <div className="svd-interactive-body">{content}</div>
      </ResearchFigurePanel>
    </ResearchFigure>
  );
}
