'use client';

import { useId, useState, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { researchMotionTransition } from '@/research/lib/motion';

type Node = { id: string; label: string };
type Edge = [string, string];
type Props = { nodes: Node[]; edges: Edge[]; locale: 'en' | 'ar'; conceptTexts?: Record<string, string> };

const positions: Record<string, [number, number]> = {
  composition: [80, 65], decomposition: [235, 65], rank: [390, 65], svd: [545, 65], rank1: [700, 65], lowrank: [700, 190],
  ey: [100, 335], pca: [300, 335], images: [500, 335], nn: [700, 335],
};
const mainPath = ['composition', 'decomposition', 'rank', 'svd', 'rank1', 'lowrank'];
const applications = ['ey', 'pca', 'images', 'nn'];
const descriptions = {
  en: {
    composition: 'Build a complex matrix transformation by composing simpler ones.',
    decomposition: 'Factorization reveals structure inside a matrix and creates useful representations.',
    rank: 'Rank counts independent directions and determines how many singular values can be nonzero.',
    svd: 'SVD writes a matrix as orthonormal input and output directions joined by independent scaling.',
    rank1: 'Each term σᵢuᵢvᵢᵀ is a rank-one matrix; their sum reconstructs A.',
    lowrank: 'Truncated SVD keeps the k largest singular values to form a rank-k approximation.',
    ey: 'The Eckart–Young theorem shows that truncated SVD is the best rank-k approximation in Frobenius and spectral norm.',
    pca: 'For centered data, singular vectors give principal directions and squared singular values determine explained variance.',
    images: 'Treating an image as a pixel matrix reveals how low-rank approximations preserve broad structure before detail.',
    nn: 'A dense weight matrix can be approximated by two narrower linear maps, reducing parameters when k is small.',
  },
  ar: {
    composition: 'نبني تحويلًا مصفوفيًا معقدًا بتركيب تحويلات أبسط.',
    decomposition: 'يكشف التفكيك بنية المصفوفة ويوفر تمثيلات مفيدة لها.',
    rank: 'تحصي الرتبة الاتجاهات المستقلة، وتحدد عدد القيم المفردة غير الصفرية الممكنة.',
    svd: 'يمثل SVD المصفوفة باتجاهات متعامدة للمدخل والخرج يصل بينها تمدد مستقل.',
    rank1: 'كل حد σᵢuᵢvᵢᵀ مصفوفة من الرتبة الأولى؛ ومجموع الحدود يعيد بناء A.',
    lowrank: 'يحتفظ SVD المبتور بأكبر k من القيم المفردة لتكوين تقريب رتبته k.',
    ey: 'تبيّن مبرهنة Eckart–Young أن SVD المبتور هو أفضل تقريب من الرتبة k وفق معياري Frobenius والطيفي.',
    pca: 'في البيانات المتمركزة، تعطي المتجهات المفردة الاتجاهات الرئيسية، وتحدد مربعات القيم المفردة التباين المفسر.',
    images: 'يكشف تمثيل الصورة كمصفوفة بكسلات كيف تحفظ التقريبات منخفضة الرتبة البنية العامة قبل التفاصيل.',
    nn: 'يمكن تقريب مصفوفة الأوزان الكثيفة بتحويلين خطيين أضيق، ما يقلل المعاملات عندما تكون k صغيرة.',
  },
} as const;

export default function SVDConceptMap({ nodes, edges, locale, conceptTexts }: Props) {
  const rtl = locale === 'ar';
  const text = descriptions[locale];
  const reduceMotion = Boolean(useReducedMotion());
  const rawId = useId();
  const markerId = `svd-map-arrow-${rawId.replace(/:/g, '')}`;
  const [selected, setSelected] = useState('lowrank');
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const core = mainPath.map((id) => nodeById.get(id)).filter((node): node is Node => Boolean(node));
  const branchNodes = applications.map((id) => nodeById.get(id)).filter((node): node is Node => Boolean(node));
  const activeEdges = edges.filter(([from, to]) => from === selected || to === selected);
  const connected = new Set(activeEdges.flat());
  const description = conceptTexts?.[selected] || text[selected as keyof typeof text];
  const transition = researchMotionTransition(reduceMotion);
  const selectByKeyboard = (event: KeyboardEvent<SVGGElement>, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(id); }
  };
  const nodeElement = (node: Node, mobile = false) => <button key={`${mobile ? 'mobile-' : ''}${node.id}`} className={`svd-map-node${selected === node.id ? ' is-selected' : ''}${connected.has(node.id) ? ' is-connected' : ''}`} aria-pressed={selected === node.id} onClick={() => setSelected(node.id)}>{node.label}</button>;

  return <div className="svd-concept-map" dir="ltr">
    <svg className="svd-map-desktop" viewBox="0 0 800 405" role="group" aria-label={rtl ? 'خريطة مفاهيم SVD' : 'SVD concept map'}>
      <defs><marker id={markerId} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L7,3.5 L0,7 Z" /></marker></defs>
      {edges.map(([from, to]) => {
        const source = positions[from]; const target = positions[to];
        if (!source || !target) return null;
        const isActive = from === selected || to === selected;
        const isBranch = applications.includes(to);
        const startX = source[0]; const startY = source[1] + 22;
        const endX = target[0]; const endY = target[1] - 24;
        const path = isBranch
          ? `M ${startX} ${startY} C ${startX} ${startY + 72}, ${endX} ${endY - 72}, ${endX} ${endY}`
          : from === 'rank1' ? `M ${startX} ${startY} L ${endX} ${endY}` : `M ${source[0] + 66} ${source[1]} L ${target[0] - 66} ${target[1]}`;
        return <motion.path key={`${from}-${to}`} className={`svd-map-edge${isActive ? ' is-active' : ''}`} d={path} markerEnd={`url(#${markerId})`} initial={false} animate={{ opacity: isActive ? 1 : 0.45, pathLength: 1 }} transition={transition} />;
      })}
      {nodes.map((node) => {
        const point = positions[node.id];
        if (!point) return null;
        const isActive = selected === node.id;
        const isConnected = connected.has(node.id);
        return <g key={node.id} className={`svd-map-svg-node${isActive ? ' is-selected' : ''}${isConnected ? ' is-connected' : ''}`} role="button" tabIndex={0} aria-label={node.label} aria-pressed={isActive} onClick={() => setSelected(node.id)} onKeyDown={(event) => selectByKeyboard(event, node.id)}>
          <rect x={point[0] - 66} y={point[1] - 23} width="132" height="46" rx="2" />
          <text x={point[0]} y={point[1] + 5} textAnchor="middle">{node.label}</text>
        </g>;
      })}
    </svg>

    <div className="svd-map-mobile" dir={rtl ? 'rtl' : 'ltr'}>
      <div className="svd-map-mobile-core">{core.map((node, index) => <div key={node.id}>{nodeElement(node, true)}{index < core.length - 1 && <span aria-hidden="true">↓</span>}</div>)}</div>
      <span className="svd-map-mobile-branch-arrow" aria-hidden="true">↓</span>
      <div className="svd-map-mobile-branches">{branchNodes.map((node) => nodeElement(node, true))}</div>
    </div>

    <motion.div key={selected} className="svd-map-detail" dir={rtl ? 'rtl' : 'ltr'} initial={reduceMotion ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
      <strong>{nodeById.get(selected)?.label}</strong><p>{description || (rtl ? 'مفهوم في بنية SVD.' : 'A concept in the structure of SVD.')}</p>
    </motion.div>
  </div>;
}
