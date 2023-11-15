import { Card, CardContent, Typography, Button, Link, CardActionArea, Dialog, DialogContent, DialogActions, TextField, CircularProgress } from "@mui/material";
import { createTheme, ThemeProvider, Theme, useTheme } from '@mui/material/styles';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';
import { TypeAnimation } from 'react-type-animation';
import React, { useState } from "react";
import axios from "axios";

import styles from '../../styles/Post.module.scss';
import { PostProps } from "./types";

// @ts-ignore
import ReadMoreAndLess from 'react-read-more-less';


const customTheme = (outerTheme: Theme) =>
  createTheme({
    palette: {
      mode: outerTheme.palette.mode,
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            '--TextField-brandBorderColor': '#5A5691',
            '--TextField-brandBorderHoverColor': '#5A5691',
            '--TextField-brandBorderFocusedColor': '#5A5691',
            '& label.Mui-focused': {
              color: "#d7d7e5"
            },
            "& .MuiFormLabel-root": {
              color: "#d7d7e5"
            },
            input: {
              color: 'white'
            }
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: {
            borderColor: 'var(--TextField-brandBorderColor)',
          },
          root: {
            [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
              borderColor: 'var(--TextField-brandBorderHoverColor)',
            },
            [`&.Mui-focused .${outlinedInputClasses.notchedOutline}`]: {
              borderColor: 'var(--TextField-brandBorderFocusedColor)',
            },
          },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          root: {
            '&:before, &:after': {
              borderBottom: '2px solid var(--TextField-brandBorderColor)',
            },
            '&:hover:not(.Mui-disabled, .Mui-error):before': {
              borderBottom: '2px solid var(--TextField-brandBorderHoverColor)',
            },
            '&.Mui-focused:after': {
              borderBottom: '2px solid var(--TextField-brandBorderFocusedColor)',
            },
          },
        },
      },
      MuiInput: {
        styleOverrides: {
          root: {
            '&:before': {
              borderBottom: '2px solid var(--TextField-brandBorderColor)',
            },
            '&:hover:not(.Mui-disabled, .Mui-error):before': {
              borderBottom: '2px solid var(--TextField-brandBorderHoverColor)',
            },
            '&.Mui-focused:after': {
              borderBottom: '2px solid var(--TextField-brandBorderFocusedColor)',
            },
          },
        },
      },
    },
  });

const Post: React.FC<PostProps> = ({ categoryType, title, description = "", externalLink, url, _id }) => {
  const outerTheme = useTheme();
  var desc = description === null ? "" : description;

  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAskClick = () => {
    setIsPromptOpen(true);
  };

  const handleClose = () => {
    setIsPromptOpen(false);
    setQuestion("");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_SERVER_ENDPOINT}/api/chatgpt/${_id}`, { question });
      setResponse(res.data.response);
    } catch (err) {
      console.error("Error:", err);
    }
    setIsLoading(false);
  };

  return (
    <Card className={styles.card} sx={{ maxWidth: 1000, backgroundColor: "#343434", border: "none" }}>
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
          ) : (
              <Button
                component={Link}
                target="_blank"
                href={externalLink}
                className={styles.button}
              >
                <Typography variant="body2" sx={{fontWeight: 900, fontSize: 18}}>
                  {categoryType === "general" ? "See Video" : "See News Article"}
                </Typography>
              </Button>
            )}
        </CardContent>
      </CardActionArea>

      <Button onClick={handleAskClick} className={styles.askButton}>Ask ChatGPT</Button>

      {/* Prompt Dialog */}
      <Dialog open={isPromptOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ backgroundColor: "#3e3e63" }}>
          <ThemeProvider theme={customTheme(outerTheme)}>
            <TextField
              autoFocus
              margin="dense"
              label="Ask a question"
              className={styles.promptDialog}
              fullWidth
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </ThemeProvider>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#3e3e63" }}>
          <Button
            onClick={handleClose}
            disabled={isLoading}
            sx={{
              color: '#23233d',
              border: '1px solid #23233d',
              backgroundColor: '#d7d7e5',
              "&:hover": {
                color: '#d7d7e5',
                backgroundColor: '#23233d'
              }
            }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            sx={{
              color: '#23233d',
              border: '1px solid #23233d',
              backgroundColor: '#d7d7e5',
              "&:hover": {
                color: '#d7d7e5',
                backgroundColor: '#23233d'
              }
            }}>
            Ask
          </Button>
        </DialogActions>
      </Dialog>

      {/* Response Dialog */}
      {
        isLoading && (
          <Dialog open={response === ""} onClose={() => setResponse("")}>
            <DialogContent sx={{ backgroundColor: "#3e3e63" }}>
              <CircularProgress sx={{ color: "#d7d7e5" }} />
            </DialogContent>
          </Dialog>
        )
      }
      {
        response && !isLoading && (
          <Dialog open={response !== ""} onClose={() => setResponse("")}>
            <DialogContent sx={{ backgroundColor: "#3e3e63" }}>
              <TypeAnimation
                sequence={[response]}
                style={{
                  color: "#fff"
                }}
              />
            </DialogContent>
          </Dialog>
        )
      }
    </Card >
  );
}

export default Post;
