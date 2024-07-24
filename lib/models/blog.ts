import { Schema, models, model } from "mongoose";

const BlogSchema = new Schema(
    {
        title: { type: "string", required: true },
        description: { type: "string" },
        user: { type: Schema.Types.ObjectId, ref: "User" }, // reference to User Schema
        category: { type: Schema.Types.ObjectId, ref: "Category" }, // reference to Category Schema
    },
    {
        timestamps: true,
    }
);

const Blog = models.Blog || model("Blog", BlogSchema);

export default Blog;