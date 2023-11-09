// Footer.tsx
import React from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Typography,
  Link,
} from '@mui/material';

const Footer: React.FC = () => {
  return (
    <BottomNavigation
      sx={{
        backgroundColor: "background.main",
        borderTop: "3px solid #0d0d0d",
        bottom: 0,
        width: '100%', 
        position: 'absolute', 
      }}
    >
      <BottomNavigationAction
        label=""
        icon={
          <Typography
            textAlign="center"
            sx={{
              color: "dark.main",
              textTransform: "none",
              fontSize: {
                xs: "10px",
                sm: "15px",
              },
              fontWeight: "bold",
            }}
          >
            <Link
              target="_blank"
              href="https://github.com/MoBensaleh/Footy-Fetch"
              color="inherit"
              sx={{
                textDecoration: "none", 
              }}
            >
              Made by Mohamed Bensaleh © 2023
            </Link>
          </Typography>
        }
        sx={{
          '&.MuiBottomNavigationAction-root': {
            minWidth: 0, 
          },
        }}
      />
    </BottomNavigation>
  );
};

export default Footer;
