import AuthForm from "@/components/auth/AuthForm";
import React from "react";

const SigninPage = () => {
  return (
    <div className="w-full h-[100vh]  flex items-center">
      <section className="w-full">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full bg-white rounded-2xl shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Signin to account
              </h1>
              <AuthForm type="login" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SigninPage;
