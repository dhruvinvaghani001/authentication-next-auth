import React from "react";

const Button = ({ type, onClick, children }) => {
  return (
    <>
      <button
        type={type}
        className="w-full text-white bg-violet-600 hover:bg-violet-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
      >
        {children}
      </button>
    </>
  );
};

export default Button;
