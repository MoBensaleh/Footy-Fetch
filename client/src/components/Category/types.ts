// Represents a single post object
export interface PostType {
    title: string;
    description: string;
    externalLink?: string;
    url?: string;
  }
  
// Represents the posts organized by categories
export interface CategoryPosts {
    news: PostType[];
    discussion: PostType[];
    general: PostType[];
  }
  
// Represents the possible category types
export type CategoryType = "news" | "discussion" | "general";
  