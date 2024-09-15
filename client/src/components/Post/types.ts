import { CategoryType } from "../Category/types";

export interface PostProps {
  categoryType: CategoryType;
  title: string;
  selfText: string;
  externalLink?: string;
  url?: string;
  _id: string;
}