import {ObjectId} from "mongoose";
export interface IPost {
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
  }
  