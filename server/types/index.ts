export interface IPost {
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
  