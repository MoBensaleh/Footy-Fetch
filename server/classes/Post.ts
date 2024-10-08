import { IPost } from "../types";
import mongoose from 'mongoose';
export class Post implements IPost {
  _id: mongoose.Types.ObjectId;
  title: string;
  selfText: string | null;
  externalLink: string | null;
  url: string | null;
  upvoteRatio: number;
  score: number;
  numComments: number;
  author: string;
  createdUtc: number;

  constructor(
    _id: mongoose.Types.ObjectId,
    title: string,
    selfText: string | null,
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
    this.selfText = selfText;
    this.externalLink = externalLink;
    this.url = url;
    this.upvoteRatio = upvoteRatio;
    this.score = score;
    this.numComments = numComments;
    this.author = author;
    this.createdUtc = createdUtc;
  }
}
