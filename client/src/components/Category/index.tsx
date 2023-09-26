import React, { useState, useEffect } from "react";
import axios from "axios";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Grid, CircularProgress } from "@mui/material";

import { CategoryType, PostType, CategoryPosts } from './types';
import Post from "../Post/index"; 
import styles from '../../styles/Category.module.scss';

/**
 * Represents the categories component
 */
const Categories: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("news");
  const [posts, setPosts] = useState<CategoryPosts>({ news: [], discussion: [], general: [] });
  const [isAPILoading, setIsAPILoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_ENDPOINT}/api/categories`);
      setPosts(response.data);
      setIsAPILoading(false);
    };
    fetchCategories();
  }, []);

  const displayPostsForCategory = (category: CategoryType) => posts[category]?.map((post: PostType) => (
    <Grid key={post.title} item xs={12} sm={6} md={4} lg={3} xl={2}>
      <Post {...post} categoryType={category} />
    </Grid>
  ));

  return (
    <div className={styles.categories}>
      <Typography component="div" align="center" className={styles.buttonsWrapper}>
        {["news", "discussion", "general"].map(category => (
          <Button
            key={category}
            variant="contained"
            color={selectedCategory === category ? "secondary" : "primary"}
            className={styles.categoryButton}
            onClick={() => setSelectedCategory(category as CategoryType)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </Typography>
      
      {isAPILoading ? (
        <CircularProgress className={styles.loadingIndicator} />
      ) : (
        <Grid container spacing={4} className={styles.gridWrapper}>
          {displayPostsForCategory(selectedCategory)}
        </Grid>
      )}
    </div>
  );
}

export default Categories;
