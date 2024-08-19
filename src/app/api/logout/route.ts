import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const response = NextResponse.json({
            message: "Logout successfully",
            success: true,

        });

        // Ensure the path and domain are set correctly to match the original cookie
        response.cookies.set("token", "", {
            httpOnly: true,
            expires: new Date(0),
            path: "/", // match the original path if it was set
            // domain: "yourdomain.com", // match the original domain if it was set
            // secure: true, // ensure this is set if your original cookie was secure
        });

        return response;
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}