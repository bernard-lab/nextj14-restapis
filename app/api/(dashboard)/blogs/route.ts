import connect from "@/lib/database";
import { NextResponse } from "next/server";
import { Types } from "mongoose"
import Blog from "@/lib/models/blog"; // model for blog
import User from "@/lib/models/users"; // reference to user model
import Category from "@/lib/models/category"; // reference to category model

export const GET = async (req: Request) => {
    try {
        // GET USER AND CATEGORY ID's FROM URL
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");
        // SEARCH KEYWORDS CONSTANT
        const searchKeywords = searchParams.get("keywords") as string;
        // DATES VARIABLES
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        // PAGE AND LIMIT CONSTANTS
        const page = Number(searchParams.get("page")|| "1"); // page starts at page 1
        const limit = Number(searchParams.get("limit") || "10");// 10 per page

        // CHECK IF USER ID OR CATEGORY ID IS VALID
        if (!userId ||!Types.ObjectId.isValid(userId) ) {
            return new NextResponse("Invalid or missing user ID", { status: 400 });
        }
        if(!categoryId ||!Types.ObjectId.isValid(categoryId)){
            return new NextResponse("Invalid or missing category ID", { status: 400 });
        }

        await connect();
        // CHECK IF USER ID EXIST IN DATABASE
        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse("User ID not found", { status: 404 });
        }

        // CHECK IF CATEGORY ID EXIST IN DATABASE
        const category = await Category.findById(categoryId);
        if (!category) {
            return new NextResponse("Category ID not found", { status: 404 });
        }

        // FILTER USER AND CATEGORY BY ID
        const filter: any = {
            user: new Types.ObjectId(userId),
            category: new Types.ObjectId(categoryId)
        }

        // SEARCH USER WITH KEYWORDS
        // $or means it exist in either title or description
        // 'i' means it's not case-sensitive
        if(searchKeywords){
            filter.$or = [
                {
                    title: { $regex: searchKeywords, $options: "i"}
                },
                {
                    description: { $regex: searchKeywords, $options: "i" }
                }
            ]
        }
        
        // FILTER BLOGS BY START DATE AND END DATE
        // $gte - >= to date, $lt - <= to date
        if(startDate && endDate){
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        } else if(startDate){
            filter.createdAt = {
                $gte: new Date(startDate)
            }
        } else if(endDate){
            filter.createdAt = {
                $lte: new Date(endDate)
            }
        }

        // PAGINATION
        const skip = (page - 1) * limit; // skip page number < limit

        // FETCH BLOGS BY USER AND CATEGORY ID WITH SKIP
        const blogs = await Blog.find(filter)
        .sort({ createAt: 'asc'}).skip(skip)
        .limit(limit);

        // RETURN BLOGS
        return new NextResponse(JSON.stringify(blogs), { status: 200 });

    } catch (err: any) {
        return new NextResponse("Error fetching blogs: " + err, { status: 500 });
    }
}

export const POST = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");

        const body = await request.json();
        const { title, description } = body;

        // CHECK IF USER ID AND CATEGORY ID EXIST IN  URL PATH
        if (!userId ||!Types.ObjectId.isValid(userId)) {
            return new NextResponse("Invalid or missing user ID", { status: 400 });
        }
        if(!categoryId || !Types.ObjectId.isValid(categoryId)){
            return new NextResponse("Invalid or missing category ID", { status: 400 }); 
        }

        await connect(); // connect to database
        
        // CHECK IF USER ID EXIST IN DATABASE
        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse("User ID not found", { status: 404 });
        }

        // CHECK IF CATEGORY ID EXIST IN DATABASE
        const category = await Category.findById(categoryId);
        if (!category) {
            return new NextResponse("Category ID not found", { status: 404 });
        }

        // CREATE NEW BLOG
        const newBlog = new Blog({
            title,
            description,
            user: new Types.ObjectId(userId), // from url or client-side (option-1 in passing url)
            category: category._id //from database or server-side (option-2 in passing url)
        });

        // SAVE NEW BLOG
        await newBlog.save();
        
        // RETURN NEWLY CREATED BLOG
        return new NextResponse(JSON.stringify({message: "Blog is created", blog: newBlog}), { status: 201 });
        
    } catch (error: any) {
        return new NextResponse("Error in fetching blogs: " + error.message, { status: 500 });
    }

}
