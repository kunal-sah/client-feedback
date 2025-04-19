import { Metadata } from "next";
import { LoginFormWrapper } from "@/components/login-form-wrapper";

export const metadata: Metadata = {
  title: "Login - Client Feedback Monthly",
  description: "Login to your account to manage client feedback.",
};

export default function LoginPage() {
  return <LoginFormWrapper />;
} 