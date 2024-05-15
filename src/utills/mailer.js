import { Resend } from "resend";
import VerifyCodeEmail from "@/emails/VerifyCode";
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ email, verifyCode }) => {
  const response = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "on boarding into our App",
    react: <VerifyCodeEmail verifyCode={verifyCode} />,
  });
  return response;
};

export { sendEmail };
