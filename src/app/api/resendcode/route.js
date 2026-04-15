import crypto from "crypto";
import User from "@/models/user.model";
import connectDB from "@/db/connect";
import { NextResponse } from "next/server";
import { sendEmail } from "@/utills/mailer";
import { createRateLimiter } from "@/utills/rateLimiter";
import { z } from "zod";

// Rate limiters ---------------------------------------------------------------
// Per-IP: max 5 resend requests per 15-minute window
const ipLimiter = createRateLimiter({
  name: "resendcode-ip",
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
});

// Per-username: max 3 resend requests per 15-minute window
const usernameLimiter = createRateLimiter({
  name: "resendcode-username",
  windowMs: 15 * 60 * 1000,
  maxRequests: 3,
});

// Input validation schema -----------------------------------------------------
const resendCodeSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(100, "Username is too long")
    .trim(),
});

// Generic message returned for all "not found / already verified" cases so
// that an attacker cannot enumerate valid usernames.
const GENERIC_OK_MESSAGE =
  "If an unverified account with that username exists, a new code has been sent.";

// Verification code expiry: 15 minutes (instead of 24 hours)
const CODE_EXPIRY_MS = 15 * 60 * 1000;

export async function POST(request) {
  try {
    // --- Extract client IP for rate limiting --------------------------------
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    const ipCheck = ipLimiter(ip);
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(ipCheck.retryAfterMs / 1000)),
          },
        }
      );
    }

    // --- Parse & validate input ---------------------------------------------
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const parsed = resendCodeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { username } = parsed.data;

    // --- Per-username rate limit ---------------------------------------------
    const usernameCheck = usernameLimiter(username);
    if (!usernameCheck.allowed) {
      // Return the generic message so the attacker cannot tell if the
      // username exists based on rate-limit timing differences.
      return NextResponse.json(
        { message: GENERIC_OK_MESSAGE },
        { status: 200 }
      );
    }

    // --- Database lookup -----------------------------------------------------
    await connectDB();

    const existUser = await User.findOne({ username });

    // Return a generic success response whether the user exists or not to
    // prevent username enumeration.
    if (!existUser) {
      return NextResponse.json(
        { message: GENERIC_OK_MESSAGE },
        { status: 200 }
      );
    }

    if (existUser.isVerified) {
      return NextResponse.json(
        { message: GENERIC_OK_MESSAGE },
        { status: 200 }
      );
    }

    if (existUser.verifyCodeExpiry && existUser.verifyCodeExpiry > Date.now()) {
      return NextResponse.json(
        {
          message:
            "A verification code was already sent recently. Please check your email or wait for it to expire before requesting a new one.",
        },
        { status: 200 }
      );
    }

    // --- Generate a cryptographically secure 6-digit code -------------------
    const verifyCode = crypto.randomInt(100000, 999999).toString();

    existUser.verifyCode = verifyCode;
    existUser.verifyCodeExpiry = Date.now() + CODE_EXPIRY_MS;
    await existUser.save();

    await sendEmail({
      email: existUser.email,
      verifyCode: existUser.verifyCode,
    });

    return NextResponse.json(
      {
        message: GENERIC_OK_MESSAGE,
        username: existUser.username,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log the full error server-side for debugging, but never expose
    // internal details to the client.
    console.error("resendcode error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
