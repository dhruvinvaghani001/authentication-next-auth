import connectDB from "@/db/connect";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const { username, verifyCode } = await request.json();

    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { message: "user does not exist !" },
        { status: 404 }
      );
    }
    if (user.isVerified) {
      return NextResponse.json(
        { message: "you are alredy verified!" },
        { status: 200 }
      );
    }
    const userVerfifyCode = user.verifyCode;

    if (userVerfifyCode == verifyCode && user.verifyCodeExpiry > Date.now()) {
      user.verifyCode = undefined;
      user.verifyCodeExpiry = undefined;
      user.isVerified = true;
      await user.save();
      return NextResponse.json(
        { message: "verify successfully !" },
        { status: 200 }
      );
    }
    if (userVerfifyCode != verifyCode) {
      return NextResponse.json(
        {
          message: "verify code is wrong",
        },
        {
          status: 400,
        }
      );
    }
    if (user.verifyCodeExpiry < Date.now()) {
      return NextResponse.json(
        {
          message: "verify code expire!",
        },
        {
          status: 403,
        }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 400 });
  }
}
