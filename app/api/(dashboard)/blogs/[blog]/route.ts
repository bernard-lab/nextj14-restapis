import connect from "@/lib/database";
import { NextResponse } from "next/server";
import { Types } from "mongoose"
import Blog from "@/lib/models/blog"; // model for blog
import User from "@/lib/models/users"; // reference to user model
import Category from "@/lib/models/category"; // reference to category model

// GET SINGLE BLOG
export const GET = async (request: Request, context: { params: any}) => {
    const blogId = context.params.blog; //word blog refers to [blob]
    try {
        // GET USER ID AND CATEGORY ID USING SEARCH PARAMS
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");
        
        // CHECK IF USER ID AND CATEGORY ID EXIST IN URL AND VALID
        if(!userId ||!Types.ObjectId.isValid(userId)){
            return new NextResponse(JSON.stringify(
                { message: "Invalid or missing userId: " + `${userId}`}
            ),  { status: 400 }
            );
        }
        if(!categoryId || !Types.ObjectId.isValid){
            return new NextResponse(JSON.stringify(
                { message: "Invalid or missing categoryId: " + `${categoryId}`}
            ),  { status: 400 }
            );
        }

        // CHECK BLOG ID IF EXIST IN URL
        if(!blogId ||!Types.ObjectId.isValid(blogId)){
            return new NextResponse(JSON.stringify(
                { message: "Invalid or missing blogId: " + `${blogId}`}
            ),  { status: 400 }
            );
        }

        await connect(); //connect to database    
        
        // CHECK IF USER EXISTS IN DATABASE
        const user = await User.findById(userId);
        if(!user){
            return new NextResponse(JSON.stringify(
                { message: "User not found "}
            ), { status: 400 });
        }

        // CHECK IF CATEGORY EXISTS IN DATABASE
        const category = await Category.findById(categoryId);
        if(!category){
            return new NextResponse(JSON.stringify(
                { message: "Category not found "}
            ), { status: 400 });
        }

        // FETCH ONE BLOG 
        const blog = await Blog.findOne({
            _id: blogId,
            user: userId,
            category: categoryId,
        });
        
        // CHECK IF BLOG EXISTS IN DATABASE
        if(!blog){
            return new NextResponse(JSON.stringify(
                { message: "Blog not found "}
            ), { status: 404 });
        }

        // RETURN ONE BLOG
        return new NextResponse(JSON.stringify({blog}), { status: 200 });

    } catch (error: any) {
        return new NextResponse("Error in fething single blog: " + error.message, {status: 500});
    }
}

// UPDATE BLOG
export const PATCH = async (request: Request, context: { params: any }) => {
    // GET BLOG ID USING PARAMS
    const blogId = context.params.blog; //blog refers to the [blog]

    try {
        // GET TITLE AND DESCRIPTION FROM BODY
        const body = await request.json();
        const { title, description } = body;

        // GET USER ID USING SEARCH PARAMS IN URL
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get("userId");
         
        // CHECK IF USER ID EXIST IN URL AND VALID
        if(!userId || !Types.ObjectId.isValid(userId)){
            return new NextResponse(JSON.stringify(
                { message: "Invalid or missing userId: " + `${userId}`}
            ),  { status: 400 }
            );
        }

        // CHECK IF BLOG ID EXIST IN URL AND VALID
        if(!blogId || !Types.ObjectId.isValid(blogId)){
            return new NextResponse(JSON.stringify(
                { message: "Invalid or missing blogId: " + `${blogId}`}
            ),  { status: 400 }
            );
        }

        await connect(); // connect to database

        // CHECK IF USER EXISTS IN THE DATABASE
        const user = await User.findById(userId);
        if(!user){
            return new NextResponse(JSON.stringify(
                { message: "User not found "}
            ), { status: 404 });
        }

        // CHECK IF BLOG EXISTS IN THE DATABASE
        const blog = await Blog.findOne({_id: blogId, user: userId});
        if(!blog){
            return new NextResponse(JSON.stringify(
                { message: "Blog not found "}
            ), { status: 404 });
        }

        // UPDATE BLOG 
        const updateBlog = await Blog.findByIdAndUpdate(
            blogId,
            { title, description }, 
            { new: true }
        );

        // RETURN UPDATED BLOG
        return new NextResponse(JSON.stringify(
            {message: "Blog updated", blog: updateBlog}
        ), { status: 200 });

    } catch (error: any) {
        return new NextResponse("Error updating blog " + error.message, {status: 500 })
    }
}

// DELETE BLOG
export const DELETE = async (request: Request, context: {params: any}) => {
    // GET BLOG USING CONTEXT PARAMS
    const blogId = context.params.blog; // blog refers to dynamic page[blog]

    try {
        // GET USER ID USING SEARCH PARAMS IN URL
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        // CHECK IF USER ID EXIST IN URL AND VALID
        if(!userId || !Types.ObjectId.isValid(userId)){
            return new NextResponse(JSON.stringify(
                { message: "Invalid or missing userId: " + `${userId}`}
            ),  { status: 400 }
            );
        }

        // CHECK IF BLOG ID EXIST IN URL AND VALID
        if(!blogId || !Types.ObjectId.isValid(blogId)){
            return new NextResponse(JSON.stringify(
                { message: "Invalid or missing blogId: " + `${blogId}`}
            ),  { status: 400 }
            );
        }

        await connect(); // connect to database

        // CHECK IF USER EXISTS IN THE DATABASE
        const user = await User.findById(userId);
        if(!user){
            return new NextResponse(JSON.stringify(
                { message: "User not found "}
            ), { status: 404 });
        }

        // CHECK IF BLOG EXISTS IN THE DATABASE
        const blog = await Blog.findOne({_id: blogId, user: userId});
        if(!blog){
            return new NextResponse(JSON.stringify(
                { message: "Blog not found "}
            ), { status: 404 });
        }

        // DELETE BLOG
        await Blog.findByIdAndDelete(blogId);

        // RETURN MESSAGE
        return new NextResponse(JSON.stringify(
            {message: "Blog is deleted", blog: blog}
        ), { status: 200 });

    } catch (error: any) {
        return new NextResponse("Error deleting blog " + error.message, {status: 500});
    }
}