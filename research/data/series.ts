export interface ResearchSeries {
  slug: string;
  title: string;
  description: string;
  format: string;
}

export const RESEARCH_SERIES: ResearchSeries[] = [
  {
    slug: 'institutional-machine',
    title: 'The Institutional Machine',
    description: 'A series about measurement, incentives, information, and control—and how powerful systems reshape the things we use to understand them.',
    format: 'Essay series',
  },
];
