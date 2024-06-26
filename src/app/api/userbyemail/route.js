import connectDB from "@/db/connect";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { email } = await request.json();
  await connectDB();
  const user = await User.findOne({ email }).select("-password -_id");
  if (!user) {
    return NextResponse.json(
      {
        message: "user does not exist",
      },
      {
        status: 404,
      }
    );
  }
  return NextResponse.json(
    { message: "user get", data: user },
    { status: 200 }
  );
}
