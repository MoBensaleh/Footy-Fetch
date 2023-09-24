import { IPost } from "../types";

export class Category {
    name: string;
    posts: IPost[];
  
    constructor(name: string, posts: IPost[]) {
      this.name = name;
      this.posts = posts;
    }
  }
  