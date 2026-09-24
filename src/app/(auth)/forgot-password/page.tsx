import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";
import { DEFAULT_OG_IMAGES } from "@/lib/seo";

const title = "Reset Your Password";
const description = "Forgot your Nexworth password? Enter your email and we'll send you a link to reset it.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/forgot-password" },
  openGraph: { title, description, images: DEFAULT_OG_IMAGES },
  twitter: { card: "summary_large_image", title, description, images: DEFAULT_OG_IMAGES },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
