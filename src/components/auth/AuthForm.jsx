"use client";
import Link from "next/link";

import React from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { useForm } from "react-hook-form";
import axios from "axios";
import { DevTool } from "@hookform/devtools";

const AuthForm = () => {
  const form = useForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = form;

  const onSubmit = async (data) => {
    console.log(data);
    const formdata = new FormData();
    for (let key in data) {
      formdata.append(key, data[key]);
    }
    try {
      const res = await axios.post("/signup", formdata);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  console.log(errors);
  return (
    <div>
      <form
        className="space-y-4 md:space-y-6"
        onSubmit={handleSubmit(onSubmit)}
      >
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
        <Button type="submit">Create a Account</Button>
        <p className="text-sm font-light text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:underline dark:text-primary-500"
          >
            Login here
          </Link>
        </p>
      </form>
      <DevTool control={control} />
    </div>
  );
};

export default AuthForm;
