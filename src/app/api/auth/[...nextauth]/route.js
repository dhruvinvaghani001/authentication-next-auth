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
        console.log(password);
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
        token._id = user._id.toString();
        token.email = user.email;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.email = token.email;
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
});

export { handler as GET, handler as POST };
