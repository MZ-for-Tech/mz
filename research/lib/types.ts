export interface BaseEditorialMetadata {
  title: string;
  title_ar?: string;
  subtitle?: string;
  subtitle_ar?: string;
  tagline?: string;
  tagline_ar?: string;
  category?: string;
  category_ar?: string;
  description?: string;
  description_ar?: string;
  keywords?: string[];
}

export interface Study extends BaseEditorialMetadata {
  id: string;
  slug: string;
  is_featured: boolean;
  published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  toc?: { id: string; label: string }[];
  authors?: { name: string; role?: string }[];
  article_type?: 'paper' | 'essay';
  series?: string;
  series_number?: number;
  content_file?: string;
  thumbnail?: string;
  thumbnail_alt?: string;
  hero_image?: string;
  hero_image_alt?: string;
  social_image?: string;
}

export type StudyWithContent = Study & {
  content_en?: string;
  content_ar?: string;
};
