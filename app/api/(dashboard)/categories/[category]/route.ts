import connect from "@/lib/database";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import Category from "@/lib/models/category";
import User from "@/lib/models/users"; //reference Schema model 

/** TO UPDATE A DYNAMIC ROUTE WITH REFERENCE 
 * category id
 * category title - data to update
 * userId in the category */
export const PATCH = async (request: Request, context: { params: any}) => {
    // GET ID IN THE DYNAMIC ROUTE(url path) [category] or its folder itself
    const categoryId = context.params.category; //the word "category" refers to the folder itself
    try {
        // REQUEST CATEGORY TITLE FROM THE BODY
        const body = await request.json(); //request body
        const { title } = body; //get title from the body

        // GET USER ID  and CHECK USER ID IF EXIST IN URL OR VALID
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        if(!userId || !Types.ObjectId.isValid(userId)){
            return new NextResponse(JSON.stringify(
                { message: "Invalid or missing userId: " + `${userId}`}
            ),  { status: 400 } ); 
        } 

        // CHECK CATEGORY ID IF EXIST IN URL OR VALID
        if(!categoryId || !Types.ObjectId.isValid(categoryId)){
            return new NextResponse(JSON.stringify(
                { message: "Invalid or missing categoryId: " + `${categoryId}`}
            ),  { status: 400 } ); 
        }

        await connect(); //connect to the database

        // CHECK IF USER ID EXIST IN THE DATABASE(MongoDB)
        const user = await User.findById(userId);
        if(!user){
            return new NextResponse(JSON.stringify(
                { message: "User not found " }
            ),  { status: 404 } ); 
        }

        //CHECK IF CATEGORY EXIST IN THE DATABASE(MongoDB)
        const category = await Category.findOne({_id: categoryId});
        if(!category){
            return new NextResponse(JSON.stringify(
                { message: "Category not found " }
            ),  { status: 404 } ); 
        }

        // FIND CATEGORY DATA TO UPDATE AND RETURN STATUS AND DATA  
        const updateCategory = await Category.findByIdAndUpdate(
            categoryId, 
            { title }, 
            { new: true }
        );

        return new NextResponse(JSON.stringify(
            { message: "Category is updated", category: updateCategory }
        ), { status: 200 }
        );

    } catch (error: any) {
        return new NextResponse('Error in updating category ' + error.message, {status: 500});
    }
}

export const DELETE = async (request: Request, context: { params: any}) => {
    // GET ID IN THE DYNAMIC ROUTE(url path) [category] or its folder itself
    const categoryId = context.params.category; //the word "category" refers to the folder itself
    try {
        // GET USER ID  and CHECK USER ID IF EXIST IN URL OR VALID
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

         // CHECK IF USER ID EXIST IN URL IS VALID OR EXIST
         if(!userId || !Types.ObjectId.isValid(userId)){
             return new NextResponse(JSON.stringify(
                 { message: "Invalid or missing user ID" }
             ),  { status: 404 } ); 
         }
 
         //CHECK IF CATEGORY EXIST IN THE URL
         if(!categoryId || !Types.ObjectId.isValid(categoryId)){
             return new NextResponse(JSON.stringify(
                 { message: "Invalid or missing category ID" }
             ),  { status: 404 } ); 
         }

         await connect();

         // CHECK IF THE USER EXIST IN DATABASE 
         const user = await User.findById(userId);
         if (!user){
            return new NextResponse(JSON.stringify(
                { message: "User not found " }
            ),  { status: 404 } ); 
         }

         //CHECK IF CATEGORY AND USER MATCH IN DATABASE
        const category = await Category.findOne( { _id: categoryId, user: userId});
        if(!category){
            return new NextResponse(JSON.stringify(
                { message: "Category not found or does not belong to the user"}
            ),  { status: 404 } );  
        }

        //DELETE THE CATERGORY
        await Category.findByIdAndDelete(categoryId);

        return new NextResponse(JSON.stringify(
            { message: "Category is deleted", category: category}
        ), { status: 200 }
        );

    } catch (error: any) {
        return new NextResponse('Error in deleting category ' + error.message, {status: 500});
    }
}