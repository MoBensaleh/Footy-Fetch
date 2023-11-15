import { PostProps } from "../Post/types";

interface Growth{
    growth: number | string;
}

export interface AnalyticsData {
    postsCountLastWeek: number;
    mostCommentedPostLastWeek: PostProps;
    userInteractionGrowth: Growth;
};