"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { SessionProvider } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  console.log(session);
  return (
    // <SessionProvider session={session}>
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col gap-10">
        {session && (
          <h1 className="text-white font-thin">{session.user.name}</h1>
        )}
        <button
          onClick={() => signOut()}
          className="p-4 bg-violet-700 rounded-lg"
        >
          Sign out
        </button>

        <button
          className="p-4 bg-violet-700 rounded-lg"
          onClick={() => signIn("google")}
        >
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
