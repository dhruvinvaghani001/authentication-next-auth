import connectDB from "@/db/connect";
import NextAuth from "next-auth";
import GoogleProviders from "next-auth/providers/google";
import User from "@/models/user.model";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    GoogleProviders({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    CredentialsProvider({
      type: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "jhondoe@gmail.com",
        },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials, req) {},
    }),
  ],
  callbacks: {
    async session({ session }) {
      const sessionUser = await User.findOne({ email: session.user.email });
      session.user.id = sessionUser._id;
      return session;
    },
    async signIn({ profile }) {
      console.log(profile);
      await connectDB();
      try {
        const existUser = await User.findOne({ email: profile.email });
        if (!existUser) {
          const user = await User.create({
            email: profile.email,
            username: profile.name,
            image: profile.picture,
          });
        }
        return true;
      } catch (error) {
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
