export type ServicePillar = {
  id: string;
  name: string;
  title: string;
  description: string;
  scope: string[];
};

/** Model Zero's Build / Deploy / Teach framework. */
export const SERVICE_PILLARS: ServicePillar[] = [
  {
    id: "01",
    name: "Build",
    title: "Custom Software & Systems",
    description:
      "We make systems that work. Websites, e-commerce, ERP, fintech and internal systems are built around your operation, with the databases, embedded systems and digitization work underneath. Arabic and English, with full RTL support.",
    scope: [
      "Software, applications, databases & data workflows",
      "Computer & embedded systems",
      "Fintech, insurance & financial reporting",
      "Digital media & content digitization",
    ],
  },
  {
    id: "02",
    name: "Deploy",
    title: "AI, Data & Analytics",
    description:
      "We give machines judgment. Specialized AI models, compression and local inference connect to the data work that feeds them: collection, surveys and analysis. Arabic document AI and our published research are part of this pillar.",
    scope: [
      "AI, machine learning & analytics",
      "Arabic OCR & document processing",
      "Data collection, statistical studies & field surveys",
    ],
  },
  {
    id: "03",
    name: "Teach",
    title: "Consulting, Training & Knowledge Transfer",
    description:
      "We make expertise replicable. Digital-transformation consulting and readiness assessments connect to institutional training in statistics, data and AI. Learning content and research partnerships extend that knowledge; every build ends with a documented handover.",
    scope: [
      "Technology education & researcher training",
      "Specialist advice & digital readiness",
      "Digital learning content & knowledge transfer",
    ],
  },
];
