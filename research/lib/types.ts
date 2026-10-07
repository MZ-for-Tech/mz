export interface BaseEditorialMetadata {
  title: string;
  title_ar?: string;
  keywords_ar?: string[];
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

export interface StudyAuthor {
  name: string;
  name_ar?: string;
  role?: string;
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
  toc_ar?: { id: string; label: string }[];
  authors?: StudyAuthor[];
  article_type?: 'paper' | 'essay';
  essay_renderer?: 'svd-story' | 'l0-story';
  series?: string;
  series_ar?: string;
  series_slug?: string;
  series_number?: number;
  arabic_translation_status?: 'draft' | 'reviewed' | 'published';
  content_file?: string;
  content_file_ar?: string;
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
