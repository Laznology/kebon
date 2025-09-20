export interface BasePage {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  tags: string[];
  created?: string;
  updated?: string;
}

export interface PageFrontmatter {
  title?: string;
  description?: string;
  tags?: string[];
  created?: string;
  updated?: string;
  status?: 'draft' | 'published';
  author?: string;
}

export interface Page extends BasePage {
  frontmatter?: PageFrontmatter;
}
