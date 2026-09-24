import type { Metadata } from "next";
import { SignInForm } from "./sign-in-form";
import { DEFAULT_OG_IMAGES } from "@/lib/seo";

const title = "Sign In";
const description =
  "Sign in to your Nexworth account to access exclusive discounts, verified benefits, and opportunities from trusted merchants across Ghana and the UK.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/sign-in" },
  openGraph: { title, description, images: DEFAULT_OG_IMAGES },
  twitter: { card: "summary_large_image", title, description, images: DEFAULT_OG_IMAGES },
};

export default function SignInPage() {
  return <SignInForm />;
}
