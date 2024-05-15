import * as React from "react";

import { Html } from "@react-email/html";
import { Button } from "@react-email/button";

const VerifyCodeEmail = ({ verifyCode }) => {
  return (
    <Html lang="en">
      <Button className="bg-violet-700 text-white p-2">{verifyCode}</Button>
    </Html>
  );
};

export default VerifyCodeEmail;
