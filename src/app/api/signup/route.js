import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectDB from "@/db/connect";
import { sendEmail } from "@/utills/mailer";

connectDB();

export async function POST(request) {
  try {
    const reqBody = await request.json();
    const { username, email, password } = reqBody;

    const existingUser = await User.findOne({
      $or: [{ username: username, email: email }],
    });

    console.log(existingUser);

    if (existingUser) {
      return NextResponse.json(
        { message: "user alredy exists with this username or email !" },
        { status: 400 }
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const createdUser = await User.create({
      username: username.trim(),
      email,
      password: hashedPass,
    });

    if (!createdUser) {
      return NextResponse.json(
        { message: "user does not created !" },
        { status: 500 }
      );
    }
    const verifyCode = Math.floor(Math.random() * 900000) + 100000;

    createdUser.verifyCode = verifyCode.toString();
    createdUser.verifyCodeExpiry = Date.now() + 24 * 60 * 60 * 1000;
    await createdUser.save();

    const reponse = await sendEmail({
      email: createdUser.email,
      verifyCode: createdUser.verifyCode,
    });

    console.log("send email res :", reponse);

    return NextResponse.json(
      { message: "user is created ! verify code for the login" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 400 });
  }
}
