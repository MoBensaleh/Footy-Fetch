import axios from 'axios';
import { Request, Response } from 'express';
import { categorizeData } from '../helpers/categorizationAlgorithm';
import { createPosts } from '../helpers/postManagement';
import PostsModel from '../models/PostModel';
import { REDDIT_ENDPOINT } from '../config/constants';
import NodeCache from 'node-cache';
import PostModel from '../models/PostModel'; 

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

        await savePosts.save();

        res.status(200).send(response.data);

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
            return res.status(200).json(cachedData);
        }

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const isoWeekAgo = oneWeekAgo.toISOString();

        const postsCountLastWeek = await PostModel.countDocuments({
            date: { $gte: isoWeekAgo }
        });


        const analyticsData = {
            postsCountLastWeek,
        };

        // Cache and send the response
        myCache.set("analyticsData", analyticsData, 3600); 
        res.status(200).json(analyticsData);
    } catch (error) {
        console.error("Failed to fetch analytics: ", error);
        res.status(500).json({ message: "Failed to fetch analytics.", error: error });
    }
};


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

