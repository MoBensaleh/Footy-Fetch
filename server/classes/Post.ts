import { IPost } from "../types";

export class Post implements IPost {
  title: string;
  description: string | null;
  externalLink: string | null;
  url: string | null;
  upvoteRatio: number;
  score: number;
  numComments: number;
  author: string;
  createdUtc: number;

  constructor(
    title: string,
    description: string | null,
    externalLink: string | null,
    url: string | null,
    upvoteRatio: number,
    score: number,
    numComments: number,
    author: string,
    createdUtc: number
  ) {
    this.title = title;
    this.description = description;
    this.externalLink = externalLink;
    this.url = url;
    this.upvoteRatio = upvoteRatio;
    this.score = score;
    this.numComments = numComments;
    this.author = author;
    this.createdUtc = createdUtc;
  }
}
