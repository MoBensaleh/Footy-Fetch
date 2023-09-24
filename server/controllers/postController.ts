import axios from 'axios';
import { Request, Response } from 'express';
import { categorizeData } from '../helpers/categorizationAlgorithm';
import { createPosts } from '../helpers/postManagement';
import PostsModel from '../models/PostModel';

const NUM_POSTS = 35;
const REDDIT_ENDPOINT = `https://www.reddit.com/r/football/hot.json?limit=${NUM_POSTS}`;

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

        res.status(200).send(categorizedData);

    } catch (err) {
        console.error("Error while handling posts: ", err);
        res.status(500).send({ error: 'Failed to fetch and process posts' });
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

// Bonus: Get a specific category by name
export const getCategoryByName = async (req: Request, res: Response): Promise<void> => {
    const categoryName = req.params.name;

    try {
        const categories = await PostsModel.find().sort({ date: -1 }).limit(1);
        if (categories.length) {
            const currentCategories = categories[0].categories;
            const category = Object.values(currentCategories).find(cat => cat.name === categoryName);
            if (category) {
                res.status(200).send(category);
            } else {
                res.status(404).send({ error: `No category found with name: ${categoryName}` });
            }
        } else {
            res.status(404).send({ error: 'No categories found in DB' });
        }
    } catch (err) {
        console.error(`Error fetching category by name ${categoryName}: `, err);
        res.status(500).send({ error: 'Failed to fetch category by name' });
    }
};
