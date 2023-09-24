import { IPost } from "../types";

export class Post implements IPost {
  title: string;
  description: string | null;
  externalLink: string | null;
  url: string | null;

  constructor(title: string, description: string | null, externalLink: string | null, url: string | null) {
    this.title = title;
    this.description = description;
    this.externalLink = externalLink;
    this.url = url;
  }
}
