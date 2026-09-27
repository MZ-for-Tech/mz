import Link from "next/link";
import { Cpu, Users } from "lucide-react";
import type { Metadata } from "next";
import Section from "@/research/features/studies/shared/Section";
import AnalysisSection from "@/research/features/studies/shared/AnalysisSection";
import Marginalia from "@/research/components/Marginalia";
import MathBox from "@/research/features/studies/shared/MathBox";
import { VisualizationEngine } from "@/research/features/engine/VisualizationEngine";
import { CUSTOM_STUDIES } from "@/research/data/studies";
import { appliedStatsStrings } from "@/research/data/strings/appliedStats";

const project = CUSTOM_STUDIES[0];

export function researchArticleMetadata(locale: string): Metadata {
    const title = locale === 'ar' && project.title_ar ? project.title_ar : project.title;
    const description = locale === 'ar' && project.description_ar ? project.description_ar : project.description || project.tagline || '';
    const path = locale === 'ar' ? `/research/ar/${project.slug}` : `/research/${project.slug}`;

    return {
        title,
        description,
        alternates: {
            canonical: path,
            languages: {
                en: `/research/${project.slug}`,
                ar: `/research/ar/${project.slug}`,
            },
        },
        authors: project.authors?.map((author) => ({ name: author.name })),
        openGraph: { title, description, url: `https://mzfortech.com${path}`, type: 'article' },
    };
}

const tocData = [
    { id: "intro", label: "Introduction" },
    { id: "methodology", label: "§1 Research Methodology" },
    { id: "baseline", label: "§2 Baseline Model Analysis" },
    { id: "lasso", label: "§3 L1 Lasso Regularization" },
    { id: "l0-gates", label: "§4 Structured L0 Gates" },
    { id: "svd", label: "§5 Low-Rank SVD" },
    { id: "synthesis", label: "§6 Discussion & Unified Synthesis" },
];

export default function ResearchArticle({ locale = 'en' }: { locale?: string }) {
    const s = appliedStatsStrings[locale as 'en' | 'ar'] || appliedStatsStrings.en;
    const project = CUSTOM_STUDIES.find(p => p.slug === 'vgg19-bloodmnist-compression');

    if (!project) return <div className="p-8 text-semantic-error">Page Not Found</div>;

    const title = (locale === 'ar' && project?.title_ar) ? project.title_ar : project?.title;
    const tagline = (locale === 'ar' && project?.tagline_ar) ? project.tagline_ar : project?.tagline;

    return (
        <div className="research-content" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <article className="max-w-4xl mx-auto relative z-10 px-5 py-16 md:px-8 md:py-24">
                <header className="mb-12 relative z-20">
                    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
                        <Link href={locale === 'ar' ? '/research/ar' : '/research'} className="font-mono text-xs uppercase tracking-widest text-ink/55 hover:text-accent">
                            ← {locale === 'ar' ? 'العودة إلى الأبحاث' : 'Back to research'}
                        </Link>
                        <div className="flex gap-3">
                            <a href="https://github.com/MZ-for-Tech/vgg19-compression" target="_blank" rel="noreferrer" className="border border-ink/20 px-4 py-2 font-mono text-xs uppercase tracking-widest hover:border-accent">GitHub</a>
                            <a href="/research-applied-stats-in-ai.pdf" download className="bg-ink px-4 py-2 font-mono text-xs uppercase tracking-widest text-paper hover:bg-accent">{locale === 'ar' ? 'تحميل البحث' : 'Read the paper'}</a>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 border-t-[3px] border-ink py-3 font-mono text-xs uppercase tracking-widest text-accent">
                        <Cpu className="h-4 w-4" /> {project.category || 'Machine Learning'}
                    </div>
                    <h1 className="max-w-4xl font-latex text-4xl leading-[0.98] tracking-tight text-ink md:text-6xl">{title}</h1>
                    {tagline && <p className="mt-5 max-w-3xl font-serif text-xl italic leading-relaxed text-ink/65 md:text-2xl">{tagline}</p>}
                    <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-y border-ink/15 py-4 font-mono text-[10px] uppercase tracking-widest text-ink/55" aria-label={locale === 'ar' ? 'محتويات البحث' : 'Paper contents'}>
                        {tocData.map((item) => <a key={item.id} href={`#${item.id}`} className="hover:text-accent">{item.label}</a>)}
                    </nav>
                </header>

                {/* Authors Section */}
                <div className="mb-12 grid grid-cols-1 gap-8 py-8 border-b border-ink/10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-tertiary">
                            <Users className="w-3 h-3" /> Research Team
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {project.authors?.map((author: { name: string; role?: string }) => (
                                <div key={author.name}>
                                    <span className="block text-sm font-bold text-ink">{author.name}</span>
                                    <span className="text-xxs font-mono uppercase text-tertiary">{author.role || "Researcher"}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <Section id="intro">
                    <div className="mb-24 last:mb-0">
                        <h2 className="text-4xl font-latex text-ink font-bold mb-4">{tocData[0].label}</h2>
                        <div className="latex-prose space-y-4">
                            <p>{s.intro_p1}</p>
                            <p>{s.intro_p2}</p>
                            <VisualizationEngine id="ModelParadox" />
                        </div>
                    </div>
                </Section>

                <Section id="methodology">
                    <AnalysisSection
                        title={s.methodology_title as string}
                    >
                        <div className="latex-prose space-y-6 mb-12 relative">
                            <Marginalia title={s.methodology_margin_title as string} side="right" topClass="top-0">
                                {s.methodology_margin_body}
                            </Marginalia>

                            <p>{s.methodology_p1}</p>
                            <MathBox latex={s.methodology_math as string} />
                            <p>{s.methodology_p2}</p>
                        </div>

                        <div className="mt-8">
                            <VisualizationEngine id="BloodMNISTExplorer" />
                        </div>
                    </AnalysisSection>
                </Section>

                <Section id="baseline">
                    <AnalysisSection
                        title={s.baseline_title as string}
                    >
                        <div className="latex-prose space-y-4 mb-12">
                            <p>{s.baseline_p1}</p>
                        </div>

                        <div className="space-y-12">
                            <VisualizationEngine id="VGGArchitectureExplorer" />

                            <div className="latex-prose mt-12 mb-8 relative">
                                <Marginalia title={s.baseline_margin_title as string} side="left" topClass="top-0">
                                    {s.baseline_margin_body}
                                </Marginalia>
                                <h3 className="text-2xl font-latex font-bold mb-4">{s.baseline_sub_title}</h3>
                                <p>{s.baseline_p2}</p>
                            </div>

                            <VisualizationEngine id="BaselineMetrics" />

                            <div className="relative mt-16 pt-12 border-t border-ink/10">
                                <Marginalia title={s.baseline_margin2_title as string} side="right" topClass="top-0">
                                    {s.baseline_margin2_body}
                                </Marginalia>
                                <VisualizationEngine id="PCARedundancy" />
                            </div>
                        </div>
                    </AnalysisSection>
                </Section>

                <Section id="lasso">
                    <AnalysisSection
                        title={s.lasso_title as string}
                    >
                        <div className="latex-prose space-y-4 mb-12">
                            <p>{s.lasso_p1}</p>
                            <MathBox latex={s.lasso_math as string} />
                            <p>{s.lasso_p2}</p>
                        </div>

                        <div className="space-y-12 relative">
                            <VisualizationEngine id="LassoPhaseTransition" />
                            <VisualizationEngine id="WeightHistogramExplorer" />
                            <Marginalia title={s.lasso_margin_title as string} side="right" topClass="top-40">
                                {s.lasso_margin_body}
                            </Marginalia>
                        </div>
                    </AnalysisSection>
                </Section>

                <Section id="l0-gates">
                    <AnalysisSection
                        title={s.l0_title as string}
                    >
                        <div className="latex-prose space-y-4 mb-12 relative">
                            <p>{s.l0_p1}</p>
                            <p>{s.l0_p2}</p>
                        </div>

                        <div className="space-y-12 relative">
                            <VisualizationEngine id="GaussianGate" />

                            <Marginalia title={s.l0_margin_title as string} side="right" topClass="top-0">
                                {s.l0_margin_body}
                            </Marginalia>

                            <div className="latex-prose mt-12 mb-8 relative">
                                <h3 className="text-2xl font-latex font-bold mb-4 italic">{s.l0_sub_title}</h3>
                                <p>{s.l0_p3}</p>
                            </div>

                            <VisualizationEngine id="PruningGradient" />

                            <div className="mt-16 pt-12 border-t border-ink/10">
                                <h3 className="text-2xl font-latex font-bold mb-6 italic">{s.l0_sub2_title}</h3>
                                <VisualizationEngine id="ChannelPruningViz" />
                            </div>

                            <div className="mt-16 pt-12 border-t border-ink/10">
                                <h3 className="text-2xl font-latex font-bold mb-6 italic underline decoration-ink/10 underline-offset-8">{s.l0_sub3_title}</h3>
                                <VisualizationEngine id="InferenceThroughputSimulator" />
                            </div>
                        </div>
                    </AnalysisSection>
                </Section>

                <Section id="svd">
                    <AnalysisSection
                        title={s.svd_title as string}
                    >
                        <div className="latex-prose space-y-4 mb-12">
                            <p>{s.svd_p1}</p>
                            <MathBox latex={s.svd_math as string} />
                        </div>

                        <div className="space-y-12 relative">
                            <VisualizationEngine id="SVDRankExplorer" />
                            <div className="latex-prose mt-12 mb-8">
                                <h3 className="text-2xl font-latex font-bold mb-4 italic">{s.svd_sub_title}</h3>
                                <p>{s.svd_p2}</p>
                            </div>
                            <VisualizationEngine id="SVDImageReconstructor" />
                            <VisualizationEngine id="SVDSweep" />
                        </div>
                    </AnalysisSection>
                </Section>

                <Section id="synthesis">
                    <div className="mb-24 last:mb-0">
                        <h2 className="text-4xl font-latex text-ink font-bold mb-8">{s.synth_title}</h2>
                        <div className="latex-prose space-y-8 relative">
                            <Marginalia title={s.synth_margin_title as string} side="left" topClass="top-0">
                                {s.synth_margin_body}
                            </Marginalia>

                            <p>{s.synth_p1}</p>

                            <VisualizationEngine id="InformationTheoryChart" />

                            <div className="my-12">
                                <h3 className="text-2xl font-latex font-bold mb-4 italic underline decoration-ink/10 underline-offset-8">{s.synth_sub_title}</h3>
                                <p>{s.synth_p2}</p>
                                <VisualizationEngine id="ParetoFrontier" />
                            </div>

                            <div className="my-12">
                                <h3 className="text-2xl font-latex font-bold mb-4 italic underline decoration-ink/10 underline-offset-8">{s.synth_sub2_title}</h3>
                                <div className="latex-prose mb-8">
                                    <p>{s.synth_p3}</p>
                                </div>
                                <VisualizationEngine id="MethodologyHeatmap" />
                            </div>

                            <div className="my-12">
                                <h3 className="text-2xl font-latex font-bold mb-4 italic underline decoration-ink/10 underline-offset-8">{s.synth_sub3_title}</h3>
                                <div className="latex-prose mb-8">
                                    <p>{s.synth_p4}</p>
                                </div>
                                <VisualizationEngine id="ConfusionHeatmap" />
                            </div>

                            <div className="mt-24 relative">
                                <Marginalia title={s.synth_margin2_title as string} side="right" topClass="top-20">
                                    {s.synth_margin2_body}
                                </Marginalia>
                                <h3 className="text-2xl font-latex font-bold mb-4 italic underline decoration-ink/10 underline-offset-8">{s.synth_sub4_title}</h3>
                                <p>{s.synth_p5}</p>
                                <VisualizationEngine id="CompoundingSimulator" />
                            </div>

                            <div className="mt-24">
                                <VisualizationEngine id="DecisionFramework" />
                            </div>

                            <div className="mt-24">
                                <VisualizationEngine id="PractitionersPlaybook" />
                            </div>

                            <VisualizationEngine id="HardwareProfile" />
                        </div>
                    </div>
                </Section>
            </article>
        </div>
    );
}
