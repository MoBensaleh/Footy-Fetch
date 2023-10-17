import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from "@mui/material";

import { AnalyticsData } from './types';
import styles from '../../styles/Analytics.module.scss';


const Analytics: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    
    useEffect(() => {
        // Fetch analytics data
        const fetchData = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_SERVER_ENDPOINT}/api/analytics`); 
                const data: AnalyticsData = res.data;
                setData(data);
            } catch (error) {
                console.error("Failed to fetch analytics data:", error);
            }
        };
        fetchData();
    }, []);
    
    if (!data) return <p>Loading...</p>;

    const { postsCountLastWeek, mostCommentedPostLastWeek, userInteractionGrowth } = data;
    const postsCount =  postsCountLastWeek;
    const mostCommentedPost = mostCommentedPostLastWeek[0]?.allPosts ?? null;
    const growthRate = userInteractionGrowth[0]?.weeklyGrowthRate ?? null;;
    
    return (
        <div className={styles.analytics}>
            {/* Most Commented Post */}
            {mostCommentedPost && (
                <div className={styles.mostCommented}>
                    <Link href={mostCommentedPost.url} className={styles.externalLink}>
                        <div className={styles.soccerBall}>
                            <div className={styles.title}>
                                <p>Most Popular Post This Week</p>
                            </div>
                        </div>
                    </Link>
                </div>
            )}
    
            <div className={styles.otherStats}>
                {/* Posts Count Last Week */}
                <div className={styles.postsCount}>
                    <h1>{postsCount}</h1>
                    <h2>Posts Last Week</h2>
                </div>
    
                {/* User Interaction Growth */}
                <div className={styles.growth}>
                    {typeof growthRate === "number" ? (
                        <p className={growthRate > 0 ? styles.up : growthRate < 0 ? styles.down : ''}>
                            {growthRate > 0 ? (
                                <>
                                    <span className={styles.arrowUp}>&uarr;</span>
                                    <span>+{growthRate.toFixed(2)}%</span>
                                </>
                            ) : growthRate === 0 ? (
                                <>
                                    <span>{growthRate}%</span>
                                </>
                            ) : (
                                <>
                                    <span className={styles.arrowDown}>&darr;</span>
                                    <span>{growthRate.toFixed(2)}%</span>
                                </>
                            )}
                        </p>
                    ) : (
                        <p>N/A</p>
                    )}
                    <h2>User Interaction Growth This Week</h2>
                </div>
            </div>
        </div>
    );
    
};

export default Analytics;