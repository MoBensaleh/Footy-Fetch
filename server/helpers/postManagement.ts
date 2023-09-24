import { Post } from '../classes/Post';

const NUM_POSTS = 35;

/**
 * Interface representing the structure of raw post data fetched from the Reddit API.
 */
interface RawPostData {
    title: string;
    selftext?: string;
    url_overridden_by_dest?: string;
    permalink?: string;
}

/**
 * Creates a Post object from the raw post data fetched from the Reddit API.
 *
 * @param {RawPostData} postData - The raw post data.
 * @returns {Post} - Returns a Post object.
 */
const createPostFromData = (postData: RawPostData): Post => {
    const title = postData.title;
    const description = postData.selftext && postData.selftext !== "" ? postData.selftext : null;
    const externalLink = postData.url_overridden_by_dest && postData.url_overridden_by_dest !== "" ? postData.url_overridden_by_dest : null;
    const url = postData.permalink && postData.permalink !== "" ? `https://www.reddit.com${postData.permalink}` : null;

    return new Post(title, description, externalLink, url);
};

/**
 * Parses the raw data fetched from the Reddit API and creates an array of Post objects.
 *
 * @param {any} posts - The raw data containing all posts fetched from the Reddit API.
 * @returns {Post[]} - Returns an array of Post objects.
 */
const createPosts = (posts: any): Post[] => {
    const cleanedPosts: Post[] = [];

    // Using 'slice' to trim the array from the start, then map over the resulting array
    posts.data.children.slice(2, NUM_POSTS).map((child: any) => {
        const rawPostData: RawPostData = child.data;
        cleanedPosts.push(createPostFromData(rawPostData));
    });

    return cleanedPosts;
};

export {
    createPosts
};
