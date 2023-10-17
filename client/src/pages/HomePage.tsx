import styles from '../styles/HomePage.module.scss';
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useState } from "react";
// import logo from "../../images/FootyFetchLogo.png";
import { Link } from "@mui/material";
import Categories from "../components/Category";
import Analytics from "../components/Analytics";



const HomePage: React.FC = () =>{
  const [showCategories, setShowCategories] = useState(false);

  return (
    <div className={styles.home}>
      <Link href="/">
        <img src="/logo.png" className={styles.logo} alt="FootyFetch Logo" />
      </Link>
      <h1 className={styles.title}>Explore what’s trending in the football world!</h1>
      {!showCategories && (
        <Typography component="div" align="center" className={styles.home__buttons_wrapper}>
          <Button
            variant="contained"
            color="primary"
            className={styles.button}
            onClick={() => setShowCategories(true)}
          >
            See Posts
          </Button>
        </Typography>
      )}
      {showCategories && <Categories />}
      {!showCategories && <Analytics />}
      {showCategories && (
        <div className={styles.footer}>
          <h3 className={styles.footerText}>
            Data for this application is fetched from Reddit's{" "}
            <Link target="_blank" href="https://www.reddit.com/r/soccer/">r/soccer</Link> subreddit.
          </h3>
          <h3 className={styles.footerText}>
            This project was developed by <Link target="_blank" href="https://www.mohamedbensaleh.com/">Mohamed Bensaleh</Link>.
            See the <Link target="_blank" href="https://github.com/MoBensaleh/Footy-Fetch">source code</Link>.
          </h3>
        </div>
      )}
    </div>
  );
}
  
export default HomePage;
