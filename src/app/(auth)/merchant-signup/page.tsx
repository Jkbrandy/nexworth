import type { Metadata } from "next";
import { MerchantSignupForm } from "./merchant-signup-form";
import { DEFAULT_OG_IMAGES } from "@/lib/seo";

const title = "Become a Merchant Partner";
const description =
  "Register your business with Nexworth, set your discount, and get discovered by verified members across Ghana and the UK.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/merchant-signup" },
  openGraph: { title, description, images: DEFAULT_OG_IMAGES },
  twitter: { card: "summary_large_image", title, description, images: DEFAULT_OG_IMAGES },
};

export default function MerchantSignupPage() {
  return <MerchantSignupForm />;
}
