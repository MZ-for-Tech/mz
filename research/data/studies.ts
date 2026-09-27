import type { StudyWithContent } from "@/research/lib/types";

export const CUSTOM_STUDIES: StudyWithContent[] = [
  {
    id: "vgg19-bloodmnist-compression",
    slug: "vgg19-bloodmnist-compression",
    title: "Statistical Compression of VGG19 for Blood-Cell Image Classification on BloodMNIST",
    tagline: "How we reduced deep learning parameters in hematological imaging while maintaining 98.4% accuracy.",
    description: "An exploration of model compression through L1 regularization, structured L0 gates, and low-rank SVD to reduce VGG19 parameters while preserving diagnostic accuracy in hematological imaging.",
    category: "Deep Learning",
    published: true,
    published_at: "2026-05-08T00:00:00+00:00",
    is_featured: true,
    created_at: "2026-05-08T00:00:00+00:00",
    updated_at: "2026-05-08T00:00:00+00:00",
    authors: [
      { name: "Ezz Eldin Ahmed", role: "Researcher" },
      { name: "Abdulrahman Mostafa Kamel", role: "Researcher" },
      { name: "Masty Ahmed", role: "Researcher" },
      { name: "Mohamed Amir", role: "Researcher" },
    ],
    toc: [
      { id: "intro", label: "Introduction" },
      { id: "methodology", label: "§1 Research Methodology" },
      { id: "baseline", label: "§2 Baseline Model Analysis" },
      { id: "lasso", label: "§3 L1 Lasso Regularization" },
      { id: "l0-gates", label: "§4 Structured L0 Gates" },
      { id: "svd", label: "§5 Low-Rank SVD" },
      { id: "synthesis", label: "§6 Discussion & Unified Synthesis" },
    ],
  },
];
