import axios from 'axios';
import { Request, Response } from 'express';
import { categorizeData } from '../helpers/categorizationAlgorithm';
import { createPosts } from '../helpers/postManagement';
import PostsModel from '../models/PostModel';
import { NUM_POSTS, SUBREDDIT } from '../config/constants';
import NodeCache from 'node-cache';
import PostModel from '../models/PostModel';
import { IPost } from '../types';
import OpenAI from 'openai';
import mongoose from 'mongoose';
import RedditClient from "reddit-client-api";

const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
const openai = new OpenAI({
    apiKey: process.env.API_KEY
});


/**
 * Controller function to fetch posts from Reddit and store them in the database.
 * @param {Request} req - The express request object.
 * @param {Response} res - The express response object.
 */
export const getPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const config = {
          apiKey: `${process.env.REDDIT_APIKEY}`,
          apiSecret: `${process.env.REDDIT_APISECRET}`,
          userAgent: `${process.env.REDDIT_USERAGENT}`,
        };
        const myRedditClient = new RedditClient(config);
        await myRedditClient.auth({ username: `${process.env.REDDIT_USERNAME}`, password: `${process.env.REDDIT_PASSWORD}` });

        const response = await myRedditClient.getHotPostsBySubreddit(SUBREDDIT, NUM_POSTS);

        const posts = response;
        const cleanedPosts = createPosts(posts);
        const categorizedData = categorizeData(cleanedPosts);

        const savePosts = new PostsModel({
            date: new Date().toISOString().slice(0, 10),
            categories: {
                categoryOne: categorizedData[0],
                categoryTwo: categorizedData[1],
                categoryThree: categorizedData[2]
            }
        });

        // Assign unique IDs to each post before saving
        (['categoryOne', 'categoryTwo', 'categoryThree'] as const).forEach((category, index) => {
            savePosts.categories[category].posts = savePosts.categories[category].posts.map((post, postIndex) => {
                const newId = new mongoose.Types.ObjectId();
                categorizedData[index].posts[postIndex]._id = newId;
                return { ...post, _id: newId };
            });
        });

        await savePosts.save();
        res.status(200).send(categorizedData);
    } catch (err) {
        console.error("Error in getPosts: ", err);
        res.status(500).send({ error: `Failed to fetch and process posts: ${err}` });
    }
};

/**
 * Controller function to fetch analytics data.
 * This includes the post count from last week, the most commented post, and user interaction growth.
 * Caches the data for efficient repeated access.
 * @param {Request} req - The express request object.
 * @param {Response} res - The express response object.
 */
export const getAnalytics = async (req: Request, res: Response) => {
    try {
        const cachedData = myCache.get("analyticsData");
        if (cachedData) {
            res.setHeader('X-Cache', 'HIT');
            res.setHeader('Cache-Control', 'public, max-age=3600'); 
            return res.status(200).json(cachedData);
        }

        const analyticsData = await fetchAnalyticsData();
        myCache.set("analyticsData", analyticsData, 3600); // Cache for 1 hour
        res.status(200).json(analyticsData);
    } catch (error) {
        console.error("Error in getAnalytics: ", error);
        res.status(500).json({ message: "Failed to fetch analytics.", error: error });
    }
};

/**
 * Helper function to fetch and calculate analytics data.
 * @returns {Promise<any>} - A promise that resolves to the analytics data.
 */
const fetchAnalyticsData = async (): Promise<any> => {
    // Calculate dates for one and two weeks ago
    const [oneWeekAgo, twoWeeksAgo] = getPastDates(7, 14);

    // Fetch data from the database
    const postsCountLastWeek = await PostModel.countDocuments({ date: { $gte: oneWeekAgo.toISOString() } });
    const mostCommentedPostLastWeek = await getMostCommentedPost(oneWeekAgo.getTime() / 1000);
    const userInteractionGrowth = await getUserInteractionGrowth(oneWeekAgo.getTime() / 1000, twoWeeksAgo.getTime() / 1000);

    return {
        postsCountLastWeek,
        mostCommentedPostLastWeek,
        userInteractionGrowth
    };
};

/**
 * Helper function to get dates for a specified number of days ago.
 * @param {number} daysForWeekAgo - Number of days for the first date.
 * @param {number} daysForTwoWeeksAgo - Number of days for the second date.
 * @returns {[Date, Date]} - Tuple of two dates.
 */
const getPastDates = (daysForWeekAgo: number, daysForTwoWeeksAgo: number): [Date, Date] => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - daysForWeekAgo);

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - daysForTwoWeeksAgo);

    return [oneWeekAgo, twoWeeksAgo];
};

/**
 * Helper function to get the most commented post in the last week.
 * @param {number} oneWeekAgoUtc - Unix timestamp of one week ago.
 * @returns {Promise<any>} - A promise that resolves to the most commented post.
 */
const getMostCommentedPost = async (oneWeekAgoUtc: number): Promise<any> => {
    try {
        const mostCommentedPost = await PostModel.aggregate([
            {
                $project: {
                    allPosts: {
                        $concatArrays: [
                            "$categories.categoryOne.posts",
                            "$categories.categoryTwo.posts",
                            "$categories.categoryThree.posts",
                        ]
                    }
                }
            },
            { $unwind: "$allPosts" },
            { $match: { "allPosts.createdUtc": { $gte: oneWeekAgoUtc } } },
            { $sort: { "allPosts.numComments": -1 } },
            { $limit: 1 },
            { $project: { _id: 0, post: "$allPosts" } }
        ]);

        return mostCommentedPost.length > 0 ? mostCommentedPost[0].post : null;
    } catch (error) {
        console.error('Error finding most commented post: ', error);
        return null;
    }
};


/**
 * Helper function to calculate the growth in user interaction.
 * @param {number} oneWeekAgoUtc - Unix timestamp of one week ago.
 * @param {number} twoWeeksAgoUtc - Unix timestamp of two weeks ago.
 * @returns {Promise<any>} - A promise that resolves to the user interaction growth data.
 */
const getUserInteractionGrowth = async (oneWeekAgoUtc: number, twoWeeksAgoUtc: number): Promise<any> => {
    try {
        const result = await PostModel.aggregate([
            {
                $project: {
                    allPosts: {
                        $concatArrays: [
                            "$categories.categoryOne.posts",
                            "$categories.categoryTwo.posts",
                            "$categories.categoryThree.posts",
                        ]
                    }
                }
            },
            { $unwind: "$allPosts" },
            {
                $group: {
                    _id: {
                        isLastWeek: { $gte: ["$allPosts.createdUtc", oneWeekAgoUtc] },
                        isTwoWeeksAgo: { $gte: ["$allPosts.createdUtc", twoWeeksAgoUtc] }
                    },
                    numComments: { $sum: "$allPosts.numComments" }
                }
            },
            {
                $project: {
                    _id: 0,
                    period: "$_id",
                    numComments: 1
                }
            }
        ]);

        // Calculate growth
        const lastWeekData = result.find(r => r.period.isLastWeek);
        const twoWeeksAgoData = result.find(r => r.period.isTwoWeeksAgo);

        const growth = lastWeekData && twoWeeksAgoData ?
            ((lastWeekData.numComments - twoWeeksAgoData.numComments) / twoWeeksAgoData.numComments) * 100 : 
            'N/A';

        return growth;
    } catch (error) {
        console.error('Error calculating user interaction growth: ', error);
        return 'N/A' ;
    }
};

/**
 * Controller function to ask ChatGPT about a specific post.
 * @param {Request} req - The express request object.
 * @param {Response} res - The express response object.
 */
export const askChatGPTAboutPost = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId;
        const question = req.body.question;

        const foundPost = await findPostById(postId);
        if (!foundPost) {
            return res.status(404).json({ message: "Post not found!" });
        }

        const prompt = `This is a post from Reddit titled "${foundPost.title}". The description says: "${foundPost.selfText}". ${question}`;
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0613",
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
            max_tokens: 1000
        });

        res.status(200).json({ response: response.choices[0].message.content?.trim() });
    } catch (error) {
        console.error("Error in askChatGPTAboutPost: ", error);
        res.status(500).json({ message: "Internal Server Error", error: error });
    }
};


/**
 * Helper function to find a post by its ID.
 * @param {string} postId - The ID of the post to find.
 * @returns {Promise<IPost | null>} - A promise that resolves to the found post or null.
 */
const findPostById = async (postId: string): Promise<IPost | null> => {
    try {
        const post = await PostModel.findOne({
            $or: [
                { 'categories.categoryOne.posts._id': postId },
                { 'categories.categoryTwo.posts._id': postId },
                { 'categories.categoryThree.posts._id': postId }
            ]
        }).lean();

        if (!post || !post.categories) return null;

        const categoryKeys: (keyof typeof post.categories)[] = ['categoryOne', 'categoryTwo', 'categoryThree'];

        for (const categoryKey of categoryKeys) {
            const foundPost = post.categories[categoryKey].posts.find((p: IPost) => p._id.toString() === postId);
            if (foundPost) return foundPost;
        }

        return null;
    } catch (error) {
        console.error('Error finding post by ID: ', error);
        return null;
    }
};

/**
 * Controller function to get the latest categories from the database.
 * @param {Request} req - The express request object.
 * @param {Response} res - The express response object.
 */
export const getCategoriesFromDB = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await PostsModel.find().sort({ date: -1 }).limit(1);
        if (categories.length) {
            res.status(200).send(categories[0].categories);
        } else {
            res.status(404).send({ error: 'No categories found in DB' });
        }
    } catch (err) {
        console.error("Error in getCategoriesFromDB: ", err);
        res.status(500).send({ error: 'Failed to fetch categories from DB' });
    }
};