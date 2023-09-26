import React, { useState } from 'react';
import { Link, Typography, Button } from '@mui/material';
import logo from '../../images/CarChat Logo.png';
import Categories from '../categories/Categories';
import './styles/home.css';

const Home: React.FC = () => {
  const [isClicked, setIsClicked] = useState(false);

  return (
    <div className="home">
      <Link href="/">
        <img className="home-logo" src={logo} alt="CarChar Logo" />
      </Link>
      <h1 className="home-title">Explore what’s trending in the football world!</h1>
      {!isClicked ? (
        <Typography component="div" align="center">
          <Button
            variant="contained"
            color="primary"
            sx={{ fontWeight: 900, fontSize: '1.3rem', "@media screen and (min-width: 550px)": { fontSize: '1.5rem' }}}
            className="home-button"
            onClick={() => setIsClicked(true)}
          >
            See Posts
          </Button>
        </Typography>
      ) : (
        <>
          <Categories />
          <div className="home-footer">
            <h3 className="home-footer-text">
              Data for this application is fetched from Reddit's <Link target="_blank" href="https://www.reddit.com/r/football/">r/football</Link> subreddit.
            </h3>
            <h3 className="home-footer-text">
              This project was developed by <Link target="_blank" href="https://www.mohamedbensaleh.com/">Mohamed</Link>. See the <Link target="_blank" href="https://github.com/MoBensaleh/Footy-Fetch">source code</Link>.
            </h3>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
