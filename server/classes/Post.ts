import { IPost } from "../types";
import { ObjectId } from 'mongoose';
export class Post implements IPost {
  _id: ObjectId;
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
    _id: ObjectId,
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
    this._id = _id;
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
