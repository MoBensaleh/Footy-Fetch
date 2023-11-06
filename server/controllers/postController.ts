import axios from 'axios';
import { Request, Response } from 'express';
import { categorizeData } from '../helpers/categorizationAlgorithm';
import { createPosts } from '../helpers/postManagement';
import PostsModel from '../models/PostModel';
import { REDDIT_ENDPOINT } from '../config/constants';
import NodeCache from 'node-cache';
import PostModel from '../models/PostModel';
import { IPost } from '../types';
import OpenAI from 'openai';
import { PostDocument } from '../models/PostModel';
import mongoose from "mongoose"


export const getPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const response = await axios.get(REDDIT_ENDPOINT);
        const posts = response.data;
        const cleanedPosts = createPosts(posts);
        const categorizedData = categorizeData(cleanedPosts);

        // Storing posts directly to the MongoDB.
        const savePosts = new PostsModel({
            date: new Date().toISOString().slice(0, 10),
            categories: {
                categoryOne: categorizedData[0],
                categoryTwo: categorizedData[1],
                categoryThree: categorizedData[2]
            }
        });
        console.log(savePosts);

        // Ensure each post has an _id before saving
        (['categoryOne', 'categoryTwo', 'categoryThree'] as const).forEach((category, index) => {
            savePosts.categories[category].posts = savePosts.categories[category].posts.map((post, postIndex) => {
                const newId = new mongoose.Types.ObjectId();
                categorizedData[index].posts[postIndex]._id = newId;  // Update the ID in categorizedData
                return { ...post, _id: newId };
            });
        });
        await savePosts.save();

        res.status(200).send(categorizedData);

    } catch (err) {
        console.error("Error while handling posts: ", err);
        res.status(500).send({ error: 'Failed to fetch and process posts' });
    }
};


const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
export const getAnalytics = async (req: Request, res: Response) => {
    try {
        // Check cache
        const cachedData = myCache.get("analyticsData");
        if (cachedData) {
            console.log("Serving data from cache");
            res.setHeader('X-Cache', 'HIT');
            res.setHeader('Cache-Control', 'public, max-age=3600'); 
            return res.status(200).json(cachedData);
        }

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const isoWeekAgo = oneWeekAgo.toISOString();

        const oneWeekAgoUtc = Math.floor(oneWeekAgo.getTime() / 1000);
        const twoWeeksAgoUtc = Math.floor(twoWeeksAgo.getTime() / 1000);


        const postsCountLastWeek = await PostModel.countDocuments({
            date: { $gte: isoWeekAgo }
        });

        const mostCommentedPostLastWeek = await PostModel.aggregate([
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
            {
                $unwind: "$allPosts"
            },
            {
                $match: {
                    "allPosts.createdUtc": { $gte: oneWeekAgoUtc }
                }
            },
            {
                $sort: {
                    "allPosts.numComments": -1
                }
            },
            {
                $limit: 1
            }
        ]).exec();


        const userInteractionGrowth = await PostModel.aggregate([
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
            {
                $unwind: "$allPosts"
            },
            {
                $project: {
                    isLastWeek: {
                        $cond: {
                            if: { $gte: ["$allPosts.createdUtc", oneWeekAgoUtc] },
                            then: 1,
                            else: 0
                        }
                    },
                    isTwoWeeksAgo: {
                        $cond: {
                            if: {
                                $and: [
                                    { $gte: ["$allPosts.createdUtc", twoWeeksAgoUtc] },
                                    { $lt: ["$allPosts.createdUtc", oneWeekAgoUtc] }
                                ]
                            },
                            then: 1,
                            else: 0
                        }
                    },
                    numComments: "$allPosts.numComments"
                }
            },
            {
                $group: {
                    _id: null,
                    lastWeekComments: {
                        $sum: {
                            $cond: { if: { $eq: ["$isLastWeek", 1] }, then: "$numComments", else: 0 }
                        }
                    },
                    twoWeeksAgoComments: {
                        $sum: {
                            $cond: { if: { $eq: ["$isTwoWeeksAgo", 1] }, then: "$numComments", else: 0 }
                        }
                    }
                }
            },
            {
                $project: {
                    weeklyGrowthRate: {
                        $cond: {
                            if: { $eq: ["$twoWeeksAgoComments", 0] },
                            then: "N/A",
                            else: {
                                $multiply: [
                                    {
                                        $divide: [
                                            { $subtract: ["$lastWeekComments", "$twoWeeksAgoComments"] },
                                            "$twoWeeksAgoComments"
                                        ]
                                    },
                                    100
                                ]
                            }
                        }
                    }
                }
            }
        ]).exec();

        const analyticsData = {
            postsCountLastWeek,
            mostCommentedPostLastWeek,
            userInteractionGrowth
        };

        // Cache and send the response
        myCache.set("analyticsData", analyticsData, 3600); // TTL 1 hour
        res.status(200).json(analyticsData);
    } catch (error) {
        console.error("Failed to fetch analytics: ", error);
        res.status(500).json({ message: "Failed to fetch analytics.", error: error });
    }
};

const openai = new OpenAI({
    apiKey: process.env.API_KEY
});


export const askChatGPTAboutPost = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId;
        const question = req.body.question;

        const categoryCollection: PostDocument | null = await PostModel.findOne({
            $or: [
                { 'categories.categoryOne.posts._id': postId },
                { 'categories.categoryTwo.posts._id': postId },
                { 'categories.categoryThree.posts._id': postId }
            ]
        });

        if (!categoryCollection) {
            return res.status(404).json({ message: "Post not found!" });
        }

        let foundPost: IPost | null = null;

        const categoryKeys = ['categoryOne', 'categoryTwo', 'categoryThree'];

        for (const categoryName of categoryKeys) {
            if (categoryName === 'categoryOne' || categoryName === 'categoryTwo' || categoryName === 'categoryThree') {
                const categoryPosts = categoryCollection.categories[categoryName].posts;
                const post = categoryPosts.find((p: IPost) => p._id.toString() === postId);

                if (post) {
                    foundPost = post;
                    break; // Exit the loop once the post is found
                }
            } else {
                console.error(`Invalid category name provided: ${categoryName}`);
                res.status(400).json({ message: "Invalid category name provided." });
            }
        }

        if (!foundPost) {
            return res.status(404).json({ message: "Post not found!" });
        }

        const prompt = `This is a post from Reddit titled "${foundPost.title}". The description says: "${foundPost.description}". ${question}`;

        const requestPayload: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
            model: "gpt-3.5-turbo-0613",
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
            max_tokens: 1000
        };

        // Make the request to OpenAI.
        const response = await openai.chat.completions.create(requestPayload);

        // Send the response from OpenAI back to the client.
        res.status(200).json({ response: response.choices[0].message.content?.trim() });

    } catch (error: unknown) {
        let errorMessage = 'An unexpected error occurred.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("An error occurred while processing the request:", errorMessage);
        res.status(500).json({ message: "Internal Server Error", error: errorMessage });
    }
}

export const getCategoriesFromDB = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await PostsModel.find().sort({ date: -1 }).limit(1);
        if (categories.length) {
            res.status(200).send(categories[0].categories);
        } else {
            res.status(404).send({ error: 'No categories found in DB' });
        }
    } catch (err) {
        console.error("Error fetching categories from DB: ", err);
        res.status(500).send({ error: 'Failed to fetch categories from DB' });
    }
};



