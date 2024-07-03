"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Home() {
  const { data: session, status } = useSession();
  console.log(session);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <Toaster />
      </div>

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
        {session && (
          <>
            <button className="bg-violet-700 rounded-xl p-4">
              {session?.user?.email}
            </button>
            <button className="bg-violet-700 rounded-xl p-4">
              {session?.user?.username}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
