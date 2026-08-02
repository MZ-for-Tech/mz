export interface ProjectProcessStep {
  phase: string;
  title: string;
  description: string;
}

export interface ProjectData {
  id: string;
  slug: string;
  name: string;
  client: string;
  category: string;
  year: string;
  tagline: string;
  description: string;
  tags: string[];
  accentColor: string;
  accentColorRgb: string;
  themeBg?: string;
  themeText?: string;
  fontFamily?: "sans" | "serif" | "mono";
  isPrivate: boolean;
  link?: string;
  screenshots: string[];
  coverImage?: string;
  process: ProjectProcessStep[];
  highlights: { label: string; value: string }[];
}

export const PROJECTS: Record<string, ProjectData> = {
  "nested-united": {
    id: "01",
    slug: "nested-united",
    name: "Nested United",
    client: "Nested United Inc.",
    category: "Web Platform & Portal",
    year: "2024",
    tagline: "A unified digital presence engineered for real estate transparency & institutional scale.",
    description:
      "Nested United required an architecture that bridges high-end architectural aesthetics with rigorous data management. We designed and built a sleek, modern web platform engineered to convey trust, clarity, and institutional capability.",
    tags: ["Web Architecture", "Frontend Systems", "Branding"],
    accentColor: "#88b600",
    accentColorRgb: "136, 182, 0",
    themeBg: "#0D0F08",
    themeText: "#F5F5F0",
    fontFamily: "sans",
    isPrivate: false,
    link: "https://nestedunited.com",
    screenshots: [],
    coverImage: "/nested/screenshots/desktop.webp",
    process: [
      {
        phase: "01 / DISCOVERY",
        title: "Deconstructing Complex Real Estate Data",
        description: "Mapped out data dependencies and established a design language rooted in structural elegance and minimal friction.",
      },
      {
        phase: "02 / ARCHITECTURE",
        title: "High-Performance Next.js Frontend",
        description: "Built a responsive, hardware-accelerated web experience with subtle micro-interactions and instant route transitions.",
      },
      {
        phase: "03 / DEPLOYMENT",
        title: "Zero-Downtime Infrastructure",
        description: "Configured resilient hosting pipelines and performance budgets to maintain 60fps rendering across all viewport sizes.",
      },
    ],
    highlights: [
      { label: "Performance Score", value: "99/100" },
      { label: "Frame Rate", value: "60 FPS" },
      { label: "Design System", value: "Custom Architectural" },
    ],
  },

};
