import type { StudyWithContent } from "@/research/lib/types";

export function hasArabicStudyMetadata(study: StudyWithContent) {
  return Boolean(study.title_ar?.trim() && study.tagline_ar?.trim() && study.description_ar?.trim());
}

export const CUSTOM_STUDIES: StudyWithContent[] = [
  {
    id: "vgg19-bloodmnist-compression",
    slug: "vgg19-bloodmnist-compression",
    title: "Statistical Compression of VGG19 for Blood-Cell Image Classification on BloodMNIST",
    title_ar: "الضغط الإحصائي لشبكة VGG19 لتصنيف صور خلايا الدم باستخدام BloodMNIST",
    tagline: "How we reduced deep learning parameters in hematological imaging while maintaining 98.4% accuracy.",
    tagline_ar: "كيف خفّضنا معاملات نموذج التعلم العميق في تصوير خلايا الدم مع الحفاظ على دقة بلغت 98.4٪.",
    description: "An exploration of model compression through L1 regularization, structured L0 gates, and low-rank SVD to reduce VGG19 parameters while preserving diagnostic accuracy in hematological imaging.",
    description_ar: "تستكشف الدراسة ضغط النماذج باستخدام تنظيم L1 وبوابات L0 المهيكلة وتحليل SVD منخفض الرتبة، لتقليل معاملات VGG19 مع الحفاظ على دقة التصنيف في الصور الطبية الدموية.",
    category: "Deep Learning",
    category_ar: "التعلم العميق",
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
