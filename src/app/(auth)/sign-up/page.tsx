import type { Metadata } from "next";
import { SignUpForm } from "./sign-up-form";
import { DEFAULT_OG_IMAGES } from "@/lib/seo";

const title = "Sign Up";
const description =
  "Create your Nexworth account to unlock verified access, exclusive discounts, and opportunities from trusted merchants across Ghana and the UK.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/sign-up" },
  openGraph: { title, description, images: DEFAULT_OG_IMAGES },
  twitter: { card: "summary_large_image", title, description, images: DEFAULT_OG_IMAGES },
};

export default function SignUpPage() {
  return <SignUpForm />;
}
