import { Card, CardContent, Typography, Button, Link, CardActionArea } from "@mui/material";
import styles from '../../styles/Post.module.scss';

import { PostProps } from "./types";

const Post: React.FC<PostProps> = ({ categoryType, title, description = "", externalLink, url }) => {

  return (
    <Card className={styles.card} sx={{ maxWidth: 1000 }}>
      <CardActionArea>
        <CardContent>
          <Typography className={styles.title} component="p">{title}</Typography>
          <h2 className={styles.description}>
            {description}
          </h2>

          {categoryType === "discussion" ? (
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
          ): (
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
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default Post;
