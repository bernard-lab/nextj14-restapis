import { NextResponse } from "next/server";
import { authMiddleware } from "./middlewares/api/authMiddleware";
import { logMiddleware } from "./middlewares/api/logMiddleware";

export const config = {
  matcher: "/api/:path*",
};

export default function middleware(req: Request){
    const authResult = authMiddleware(req);

    // Validation to blogs pages
    // add - && req.url.includes("/api/blogs") to validate blogs pages only
    // remove - && req.url.includes("/api/blogs") to validate all pages
    if(!authResult?.isValid && req.url.includes("/api/blogs")){
        return new NextResponse(JSON.stringify({ message: "Unauthorized"}), { status: 401 });
    }

    // Get Method Used to users page
    if(req.url.includes("/api/users")){
        const logResult = logMiddleware(req);
        console.log(logResult.response);
    }

    return NextResponse.next();
}