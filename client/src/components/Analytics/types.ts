import { PostProps } from "../Post/types";



export interface AnalyticsData {
    postsCountLastWeek: number;
    mostCommentedPostLastWeek: PostProps;
    userInteractionGrowth: number | string;
};