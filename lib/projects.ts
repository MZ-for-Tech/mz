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

  "null-hypothesis": {
    id: "02",
    slug: "null-hypothesis",
    name: "The Null Hypothesis",
    client: "MZ Research / TNH",
    category: "Research Journal & Interactive Portal",
    year: "2024",
    tagline: "A minimalist, paper-inspired digital publication space for rigorous technical writing.",
    description:
      "The Null Hypothesis (TNH) is our research division's publication engine. Built with deep respect for editorial typography, high-contrast serif aesthetics, and academic clarity. It transforms raw technical papers into an immersive reading experience.",
    tags: ["Editorial Design", "Publishing System", "Research Portal"],
    accentColor: "#8B1A1A",
    accentColorRgb: "139, 26, 26",
    themeBg: "#F5F5F0",
    themeText: "#1A1208",
    fontFamily: "serif",
    isPrivate: false,
    link: "https://nullhypothesis.dev",
    screenshots: [],
    process: [
      {
        phase: "01 / PHILOSOPHY",
        title: "Embracing Paper Aesthetics Digital-First",
        description: "Crafted an ultra-focused typographic grid honoring physical journals with rich serif typography (Cormorant Garamond) and deep crimson accents.",
      },
      {
        phase: "02 / ENGINE",
        title: "Markdown & Mathematical Rendering",
        description: "Engineered high-speed dynamic rendering for inline LaTeX equations, code blocks, and static scientific artifacts.",
      },
      {
        phase: "03 / KNOWLEDGE TRANSFER",
        title: "Open Knowledge Protocol",
        description: "Designed a clean archival taxonomy ensuring all research remains searchable, indexable, and permanent.",
      },
    ],
    highlights: [
      { label: "Typography", value: "Cormorant Garamond" },
      { label: "Reader Focus", value: "100% Distraction-Free" },
      { label: "Publication Type", value: "Academic & Systems" },
    ],
  },

  "ssc-league": {
    id: "03",
    slug: "ssc-league",
    name: "SSC League Platform",
    client: "SSC Sports Federation",
    category: "Internal Operating System",
    year: "2024",
    tagline: "High-concurrency league management and real-time tournament operating console.",
    description:
      "A proprietary internal operating dashboard handling real-time score tracking, team rosters, scheduling algorithms, and institutional governance for competitive leagues.",
    tags: ["Internal System", "Real-Time Dashboard", "Proprietary"],
    accentColor: "#D4A820",
    accentColorRgb: "212, 168, 32",
    themeBg: "#0F0E0A",
    themeText: "#F5F5F0",
    fontFamily: "mono",
    isPrivate: true,
    screenshots: [],
    process: [
      {
        phase: "01 / GOVERNANCE",
        title: "Protocol & Permission Hierarchy",
        description: "Structured multi-tenant access controls for ref, admin, analyst, and executive roles.",
      },
      {
        phase: "02 / STREAMING ENGINE",
        title: "Sub-Second Event Syncing",
        description: "Implemented low-latency WebSocket conduits for instant state propagation across all pitchside terminals.",
      },
    ],
    highlights: [
      { label: "Security Tier", value: "Restricted Enterprise" },
      { label: "Latency", value: "< 50ms State Sync" },
      { label: "Deployment", value: "On-Premises Airgap" },
    ],
  },

  "erp-system": {
    id: "04",
    slug: "erp-system",
    name: "Custom Enterprise ERP",
    client: "Confidential Enterprise Client",
    category: "Resource Planning & Analytics",
    year: "2023 - 2024",
    tagline: "End-to-end automated supply chain, financial ledger, and operational telemetry platform.",
    description:
      "Built from the ground up to replace fragmented legacy software. Delivers real-time inventory reconciliation, financial forecasting, and human capital analytics within a single unified command interface.",
    tags: ["ERP", "Financial Systems", "Enterprise SaaS"],
    accentColor: "#5A7A0A",
    accentColorRgb: "90, 122, 10",
    themeBg: "#0A0C08",
    themeText: "#F5F5F0",
    fontFamily: "sans",
    isPrivate: true,
    screenshots: [],
    process: [
      {
        phase: "01 / AUDIT",
        title: "Mapping Legacy Workflows",
        description: "Spent weeks embedded within operations to identify latency traps and data entry redundant loops.",
      },
      {
        phase: "02 / CORE ENGINE",
        title: "Immutable Transaction Ledger",
        description: "Architected a double-entry financial ledger core ensuring 100% auditability and data integrity.",
      },
    ],
    highlights: [
      { label: "Access Level", value: "Internal Proprietary" },
      { label: "Modules Built", value: "14 Custom Microservices" },
      { label: "Data Integrity", value: "ACID Compliant Ledger" },
    ],
  },
};
