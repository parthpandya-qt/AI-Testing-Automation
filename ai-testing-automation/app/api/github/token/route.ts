import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req:NextRequest) {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({error:"Unauthorized"},{status:401});
    }

    const token = req.cookies.get(`github_token_${user.id}`)?.value || req.cookies.get("github_token")?.value;
    if(!token){
        return NextResponse.json({error:"Unauthorized"},{status:401});
    }
    return NextResponse.json({token:token});
}