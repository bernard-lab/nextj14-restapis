import { NextResponse } from "next/server";
import connect from "@/lib/database";
import User from "@/lib/models/users";
import Types from "mongoose";
import mongoose from "mongoose";

// Variable to check mongodb id is in correct format or not
const ObjectId = require("mongoose").Types.ObjectId;

// READ
export const GET = async () => {
    try {
        await connect();                 //connect to database
        const users = await User.find(); //find all User
        return new NextResponse(JSON.stringify(users), {status: 200})
    } catch (error: any) {
        return new NextResponse('User Route Error:' + error + {status: 500});
    }
}

// CREATE 
export const POST = async (request: Request) => {
    try {
        const body = await request.json();
        await connect();   //connect to the database

        const newUser = new User(body); //Create new instance of user from client-side
        await newUser.save();           //Save the created user instance.

        return new NextResponse(JSON.stringify(
            { message: "New User is created!", user: newUser }),
            { status: 200 }
        )
    } catch (error: any) {
        return new NextResponse("Error in creating new user: " + error,
            {status: 500}
        )
    }    
}

// UPDATE
export const PATCH = async (request: Request) => {
    try {
        const body = await request.json(); //request the body
        const { userId, newUsername } = body; //get userId from the body
        await connect(); //connect to database
       
        // CHECK USER ID IF EXIST
        if(!userId || !newUsername) {
            return new NextResponse(JSON.stringify(
                { message: `User ID not found in the database`}), 
                {status: 400}
            );
        }

        if(!Types.isValidObjectId(userId)) {
            return new NextResponse(JSON.stringify(
                { message: `Invalid user id. ( {userId} )`}), 
                {status: 400}
            );
        }

        // USER EXISTS
        const updateUser = await User.findOneAndUpdate(
            { _id: new ObjectId(userId)},
            { username: newUsername },
            { new: true } // will return new user instead of replaced user
        );

        // USER UPDATE FAILED
        if (!updateUser){
            return new NextResponse(JSON.stringify(
                {message: "Failed to update user"}), 
                {status: 400}
            )
        }

        // UPDATE USER SUCCESSFUL
        return new NextResponse(JSON.stringify(
            { message: "User is updated", user: updateUser}),
            { status: 200 }
        )
    } catch (error: any) {
        return new NextResponse("Error in updating user: " + error,
            { status: 500 }
        )
    }
}

// DELETE
export const DELETE = async (request: Request) => {
    try {
        const {searchParams} = new URL(request.url); //search user id in url path
        const userId = searchParams.get("userId");
        
        // USER ID NOT EXISTS
        if(!userId){
            return new NextResponse(JSON.stringify(
                { message: "User ID not found"} ),
                { status: 400 }
        );
        }

        // INVALID USER ID
        if(!mongoose.Types.ObjectId.isValid(userId)) {
            return new NextResponse(JSON.stringify(
                { message: `Invalid user id. ( {userId} )`}), 
                {status: 400}
            );
        }

        await connect(); //connect to database

        // DELETE USER
        const deleteUser = await User.findByIdAndDelete(
            new mongoose.Types.ObjectId(userId)
        );

        if(!deleteUser){
            return new NextResponse(JSON.stringify( 
                { message: "User not found in the database."}),
                { status: 400 }
            );
        }

        return new NextResponse(JSON.stringify(
            { message: "User is successfully deleted.", user: userId}
        ),  { status: 200 }
    );
    } catch (error: any) {
        return new NextResponse("Error in deleting user" + error.message, 
            { status: 500 } );
    }
}