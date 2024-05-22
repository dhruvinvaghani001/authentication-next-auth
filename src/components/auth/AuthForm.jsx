"use client";
import Link from "next/link";

import React, { useEffect } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const AuthForm = ({ type }) => {
  const isLoginForm = type == "login";
  const form = useForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = form;
  const router = useRouter();

  const handleGoogleSignin = async () => {
    const result = await signIn("google");
  };

  const onSubmit = async (data) => {
    if (isLoginForm) {
      try {
        const res = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        const resData = await axios.post("/api/userbyemail", {
          email: data.email,
        });
        const username = resData.data.data;
        if (!res.ok) {
          if (res.error == "you are not verified !") {
            const resData = await axios.post("/api/userbyemail", {
              email: data.email,
            });
            const { username } = resData.data.data;
            toast.error(res.error);
            router.push(`/verify/${username}`);
            return;
          }
          toast.error(res.error);
        }
        if (res.ok) {
          toast.success("User loged in Successfully!");
          router.push("/");
          return;
        }
      } catch (error) {
        toast.error(error);
      }
    } else {
      try {
        const res = await axios.post("/api/signup", {
          email: data.email,
          username: data.username,
          password: data.password,
        });
        if (res.status == 200) {
          console.log(res);
          toast.success(res.data.message);
          router.push(`/verify/${res.data.username}`);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    }
  };
  return (
    <div>
      <div>
        <Toaster />
      </div>
      <form
        className="space-y-4 md:space-y-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        {!isLoginForm && (
          <div>
            <Input
              label="username"
              type="text"
              id="username"
              placeholder="jhon doe"
              {...register("username", { required: "Username is required !" })}
            />
            {errors.username && (
              <p className="text-red-500 mt-1">{errors.username.message}</p>
            )}
          </div>
        )}
        <div>
          <Input
            label="email"
            type="email"
            id="email"
            placeholder="jhondoe@gmail.com"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && (
            <p className="text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <Input
            label="password"
            type="password"
            id="password"
            placeholder="••••••••"
            {...register("password", { required: "Password is required!" })}
          />
          {errors.password && (
            <p className="text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>
        <Button type="submit" className=" bg-violet-600 hover:bg-violet-700  ">
          {isLoginForm ? "Login" : "Create a Account"}
        </Button>
        <div>
          {isLoginForm && (
            <Button
              className="px-4 py-2 border flex gap-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150 bg-white hover:bg-gray-100"
              type="button"
              onClick={handleGoogleSignin}
            >
              <img
                className="w-6 h-6"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                loading="lazy"
                alt="google logo"
              />
              <span className="text-black">Sign in with Google</span>
            </Button>
          )}
        </div>
        <p className="text-sm font-light text-gray-500 dark:text-gray-400">
          {isLoginForm ? "Don't have an account? " : "Already have an account?"}
          <Link
            href={isLoginForm ? "/signup" : "/signin"}
            className="font-medium text-primary-600 hover:underline dark:text-primary-500"
          >
            {isLoginForm ? "Create Account" : " Login here"}
          </Link>
        </p>
      </form>
    </div>
  );
};

export default AuthForm;
