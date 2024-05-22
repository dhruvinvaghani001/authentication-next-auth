export { default } from "next-auth/middleware";
import { User } from "lucide-react";
import { connect } from "mongoose";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import connectDB from "./db/connect";
import axios from "axios";

export async function middleware(request) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;
  const isPublicPath = path == "/signin" || path == "/signup";
  if (path.startsWith("/verify") && token) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }
  if (path.startsWith("/verify") && !token) {
    const username = path.split("/")[2];
    try {
      const res = await axios.post("http://localhost:3000/api/user", {
        username,
      });
      if (res.statusText == "OK") {
        const userIsVerified = res.data.data.isVerified;
        console.log(res.data.data);
        console.log(userIsVerified);
        if (userIsVerified) {
          return NextResponse.redirect(new URL("/", request.nextUrl));
        } else {
          return NextResponse.next();
        }
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/", request.nextUrl));
    }
  }
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  } else if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/signin", request.nextUrl));
  }
}

export const config = {
  matcher: ["/", "/signin", "/signup", "/verify/:path*"],
};
