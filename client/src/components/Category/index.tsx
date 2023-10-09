import React, { useState, useEffect } from "react";
import axios from "axios";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Grid, CircularProgress } from "@mui/material";

import { CategoryType, PostType, CategoryPosts } from './types';
import Post from "../Post"; 
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
        try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_ENDPOINT}/api/posts`);
            console.log(await axios.get(`${process.env.REACT_APP_SERVER_ENDPOINT}/api/analytics`))
            
            // Transform the data into the desired shape
            const transformedData: CategoryPosts = {
                news: [],
                discussion: [],
                general: []
            };

            response.data.forEach((category: any) => {
                switch (category.name) {
                    case 'news':
                        transformedData.news = category.posts;
                        break;
                    case 'discussions': 
                        transformedData.discussion = category.posts;
                        break;
                    case 'general':
                        transformedData.general = category.posts;
                        break;
                    default:
                        break;
                }
            });

            // Set the state with the transformed data
            setPosts(transformedData);
            setIsAPILoading(false);
        } catch (error) {
            console.error("Error fetching posts:", error);
            setIsAPILoading(false);
        }
    };
    fetchCategories();
}, []);


  const displayPostsForCategory = (category: CategoryType) => posts[category]?.map((post: PostType) => (
    <Grid key={post.title} item alignItems={"center"} xs={12} sm={12} md={12} lg={6} xl={6}>
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

        <Grid container spacing={4}  columnSpacing={{ sm: 2, md: 3 }} className={styles.gridWrapper}>
          {displayPostsForCategory(selectedCategory)}
        </Grid>
      )}
    </div>
  );
}

export default Categories;
