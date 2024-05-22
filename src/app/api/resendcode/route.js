import User from "@/models/user.model";
import connectDB from "@/db/connect";
import { NextResponse } from "next/server";
import { sendEmail } from "@/utills/mailer";

export async function POST(request) {
  const { username } = await request.json();
  try {
    const existUser = await User.findOne({ username });
    if (!existUser) {
      return NextResponse.json(
        { message: "user does not exist !" },
        { status: 404 }
      );
    }
    if (existUser.isVerified) {
      return NextResponse.json(
        { message: "you are alredy verified!" },
        { status: 400 }
      );
    }
    if (existUser.verifyCodeExpiry > Date.now()) {
      return NextResponse.json(
        {
          message: "your previos code is still alive use it!",
        },
        {
          status: 401,
        }
      );
    }
    const verifyCode = Math.floor(Math.random() * 900000) + 100000;

    existUser.verifyCode = verifyCode.toString();
    existUser.verifyCodeExpiry = Date.now() + 24 * 60 * 60 * 1000;
    await existUser.save();

    const reponse = await sendEmail({
      email: existUser.email,
      verifyCode: existUser.verifyCode,
    });

    console.log("send email res :", reponse);

    return NextResponse.json(
      {
        message: "verify code resend to your email!",
        username: existUser.username,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
