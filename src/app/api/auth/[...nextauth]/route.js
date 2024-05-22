import connectDB from "@/db/connect";
import NextAuth from "next-auth";
import GoogleProviders from "next-auth/providers/google";
import User from "@/models/user.model";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

const handler = NextAuth({
  providers: [
    GoogleProviders({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    CredentialsProvider({
      type: "credentials",
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "jhondoe@gmail.com",
        },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials, req) {
        const email = credentials.email;
        const password = credentials.password;
        await connectDB();
        const user = await User.findOne({ email });
        console.log(user);
        if (!user) {
          throw new Error("user does not exist!");
        }
        if (!user.isVerified) {
          throw new Error("you are not verified !");
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        console.log("passcheck" + isPasswordCorrect);
        if (!isPasswordCorrect) {
          throw new Error("Password is wrong!");
        }
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user?._id?.toString();
        token.email = user.email;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token, user }) {
      await connectDB();
      const sessionUser = await User.findOne({ email: session.user.email });
      if (token) {
        session.user._id = token._id;
        session.user.email = token.email;
        session.user.username = token.username;
      }
      if (sessionUser) {
        session.user._id = sessionUser._id;
      }
      return session;
    },
    async signIn({ profile, account }) {
      if (account.provider === "google") {
        try {
          await connectDB();

          const existingUser = await User.findOne({ email: profile.email });
          if (existingUser && !existingUser.googleSignIn) {
            throw new Error("user is not google signup use credential !");
          }
          if (!existingUser) {
            // Create a new user
            const newUser = new User({
              username: profile.name.trim(),
              email: profile.email,
              isVerified: true,
              googleSignIn: true,
            });
            await newUser.save();
          }
        } catch (error) {
          console.log(error.message);
          return Promise.reject(new Error(error.message));
        }
      }
      return true;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
  },
});

export { handler as GET, handler as POST };
