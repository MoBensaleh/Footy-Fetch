import { Card, CardContent, Typography, Button, Link, CardActionArea } from "@mui/material";
import styles from '../../styles/Post.module.scss';
import ReadMoreAndLess from "react-read-more-less";

import { PostProps } from "./types";

const Post: React.FC<PostProps> = ({ categoryType, title, description = "", externalLink, url }) => {
  const width = categoryType === "discussion" ? 1000 : 500;

  return (
    <Card className={styles.card} sx={{ maxWidth: width }}>
      <CardActionArea>
        <CardContent>
          <Typography className={styles.title} component="p">{title}</Typography>
          <div className={styles.description}>
            <ReadMoreAndLess
              className="read-more-content"
              readMoreText=" Read more"
              readLessText=" Read less"
            >
              {description}
            </ReadMoreAndLess>
          </div>
          <Button
              component={Link}
              target="_blank"
              href={externalLink}
              className={styles.button}
          >
              <Typography variant="body2">
                  {categoryType === "general" ? "See Video" : "See News Article"}
              </Typography>
          </Button>

          {categoryType === "discussion" && (
              <Button
                  component={Link}
                  target="_blank"
                  href={url}
                  className={styles.button}
              >
                  <Typography variant="body2">
                      See Online Discussion
                  </Typography>
              </Button>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default Post;
