import type { Metadata } from "next";
import { ResetPasswordScreen } from "./reset-password-form";
import { DEFAULT_OG_IMAGES } from "@/lib/seo";

const title = "Set Your Password";
const description = "Set your password to activate your Nexworth account.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: { title, description, images: DEFAULT_OG_IMAGES },
  twitter: { card: "summary_large_image", title, description, images: DEFAULT_OG_IMAGES },
};

export default function ResetPasswordPage() {
  return <ResetPasswordScreen />;
}
