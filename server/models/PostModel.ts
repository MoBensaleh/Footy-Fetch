import mongoose, { Document, Model } from 'mongoose';
import { Post } from '../classes/Post';

interface CategoryDocument {
    name: string;
    posts: Post[];
}

export interface PostDocument extends Document {
    date: Date;
    categories: {
        categoryOne: CategoryDocument;
        categoryTwo: CategoryDocument;
        categoryThree: CategoryDocument;
    };
}

const CategorySchema = new mongoose.Schema<CategoryDocument>({
    name: {
        type: String,
        required: true
    },
    posts: [{
        title: String,
        description: String,
        externalLink: String,
        url: String
    }]
});

const PostSchema = new mongoose.Schema<PostDocument>({
    date: {
        type: Date,
        required: true
    },
    categories: {
        categoryOne: CategorySchema,
        categoryTwo: CategorySchema,
        categoryThree: CategorySchema
    }
});

const PostModel: Model<PostDocument> = mongoose.model('Post', PostSchema);

export default PostModel;