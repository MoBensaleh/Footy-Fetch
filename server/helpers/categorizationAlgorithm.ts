import { Category } from "../classes/Category";
import { IPost } from "../types";

export const categorizeData = (posts: IPost[]) => {
  const discussionsArray: IPost[] = [];
  const newsArray: IPost[] = [];
  const generalArray: IPost[] = [];

  posts.forEach((post) => {
    if (post.description) {
      discussionsArray.push(post);
    } else if (post.externalLink && !post.externalLink.includes("youtu")) {
      newsArray.push(post);
    } else {
      generalArray.push(post);
    }
  });

  return [
    new Category("discussions", discussionsArray),
    new Category("news", newsArray),
    new Category("general", generalArray),
  ];
};
