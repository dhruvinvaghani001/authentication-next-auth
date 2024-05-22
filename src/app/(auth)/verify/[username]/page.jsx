"use client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

const VerifyCode = ({ params }) => {
  const form = useForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;
  const router = useRouter();

  const onSubmit = async (data) => {
    const username = params.username;
    const verifyCode = data.code;
    try {
      const response = await axios.post("/api/verifycode", {
        username,
        verifyCode,
      });
      toast.success(response.data.message, { duration: 2500 });
      router.push("/signin");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const resendVerifyCode = async () => {
    const username = params.username;
    try {
      const response = await axios.post("/api/resendcode", {
        username,
      });
      toast.success(response.data.message, { duration: 2500 });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="w-full h-[100vh]  flex items-center">
      <Toaster />
      <section className="w-full">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full bg-white rounded-2xl shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Verify Your Account
              </h1>
              <form
                className="space-y-4 md:space-y-6"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <Input
                    type="text"
                    label="verification code"
                    {...register("code", { required: "code is required" })}
                  />
                  {errors.code && (
                    <p className="mt-1 text-red-700">{errors.code.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700  "
                >
                  Verify
                </Button>
                <Button
                  type="button"
                  className="bg-violet-600 hover:bg-violet-700"
                  onClick={resendVerifyCode}
                >
                  Resend Code
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VerifyCode;
