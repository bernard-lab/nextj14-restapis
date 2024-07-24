import connect from "@/lib/database";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import Category from "@/lib/models/category";
import User from "@/lib/models/users";//reference Schema model

export const GET = async (request: Request) => {
    try {
        // GET USER ID
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        // CHECK USER ID IF EXIST OR VALID
        if(!userId || !Types.ObjectId.isValid(userId)){
            return new NextResponse(JSON.stringify(
                { message: "Invalid or missing userId: " + `${userId}`}
            ),  { status: 400 }
        );
        }
        
        await connect(); // CONNECT TO DATABASE 
        const user = await User.findById(userId);
        
        if(!user){
            return new NextResponse(JSON.stringify(
                { message: "User not found in the database"}
            ), { status: 400 });
        }

        // CREATE CATEGORY INSTANCE
        // Check if userId exist in the category
        // This will secure if tha userId created the category
        const categories = await Category.find(
            { user: new Types.ObjectId(userId) } 
        );

        return new NextResponse(JSON.stringify(categories), 
        { status: 200 }
    );

    } catch (error: any) {
        return new NextResponse("Error in fetching categories " + error.message, { status: 500 });
    }
}

export const POST = async (request: Request) => {
   try {
        // GET USER ID
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        // GET CATEGORY TITLE
        const {title} = await request.json();

        // CHECK IF USER EXIST OR VALID
        if(!userId || !Types.ObjectId.isValid(userId)){
            return new NextResponse(JSON.stringify(
                { message: "Invalid or missing userId: " + `${userId}`}
            ),  { status: 400 }
            );
        }

        // CONNECT TO DATABASE AND CHECK IF USER EXIST
        await connect(); 
        const user = await User.findById(userId);
        if(!user){
            return new NextResponse(JSON.stringify(
                { message: "User not found "}
            ), { status: 400 });
        }

        // CREATE NEW CATEGORY
        const newCategory = new Category({
            title,
            user: new Types.ObjectId(userId),
        });         
        await newCategory.save(); //Save new Category

        return new NextResponse(JSON.stringify(
            { message: "New Category is created.", category: newCategory}
        ), { status: 200});

   } catch (error: any) {
        return new NextResponse('Error in creating categroy: ' + error.message, {status: 500});
   } 
}