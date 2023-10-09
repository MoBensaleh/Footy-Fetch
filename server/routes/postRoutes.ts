import express from "express";
import * as PostController from "../controllers/postController"

const router = express.Router();

// GET request to obtain all posts from Reddit API
router.get("/posts", PostController.getPosts);

// GET categories from server
router.get("/categories", PostController.getCategoriesFromDB);

// GET db analytics from server
router.get("/analytics", PostController.getAnalytics);


export default router;