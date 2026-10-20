export type ServicePillar = {
  id: string;
  name: string;
  title: string;
  description: string;
  scope: string[];
};

/** MZ's Build / Apply / Teach framework, grounded in its registered activities. */
export const SERVICE_PILLARS: ServicePillar[] = [
  {
    id: "01",
    name: "Build",
    title: "Systems made for the work they do.",
    description:
      "We design and develop software, applications, information systems, and embedded technology—from first specification through operation.",
    scope: [
      "Software, applications, databases & data workflows",
      "Computer & embedded systems",
      "ICT, electronics, data centers & outsourcing",
      "Digital media & content digitization",
    ],
  },
  {
    id: "02",
    name: "Apply",
    title: "Research put to practical use.",
    description:
      "We apply AI, data analysis, and research to the systems and decisions shaping modern organizations.",
    scope: [
      "AI, machine learning & analytics",
      "Fintech, insurance & compliance systems",
      "Advanced technology, field research & IP",
    ],
  },
  {
    id: "03",
    name: "Teach",
    title: "Knowledge that moves with the technology.",
    description:
      "We help people and institutions understand, operate, and extend technology through training, advisory, and transfer.",
    scope: [
      "Technology education & researcher training",
      "Specialist advice & digital readiness",
      "Information technology transfer, incubation & entrepreneurship",
    ],
  },
];
