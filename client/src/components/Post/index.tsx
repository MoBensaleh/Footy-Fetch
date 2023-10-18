import { Card, CardContent, Typography, Button, Link, CardActionArea } from "@mui/material";
import styles from '../../styles/Post.module.scss';
import { PostProps } from "./types";

// @ts-ignore
import ReadMoreAndLess from 'react-read-more-less';


const Post: React.FC<PostProps> = ({ categoryType, title, description = "", externalLink, url }) => {
  var desc = description === null ? "" : description;
  return (
    <Card className={styles.card} sx={{ maxWidth: 1000 }}>
      <CardActionArea>
        <CardContent>
          <Typography className={styles.title} component="p">{title}</Typography>
          <div className={styles.description}>
            <ReadMoreAndLess
                className="read-more-content"
                readMoreText=" Read more"
                readLessText=" Read less"
            >
                {desc}
            </ReadMoreAndLess>

          </div>
        
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
