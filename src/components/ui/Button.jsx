import React from "react";

const Button = ({ type, onClick, className, children }) => {
  return (
    <>
      <button
        onClick={onClick}
        type={type}
        className={` w-full text-white font-medium rounded-lg  text-center text-sm px-5 py-2.5 flex justify-center items-center gap-10 ${className}`}
      >
        {children}
      </button>
    </>
  );
};

export default Button;
