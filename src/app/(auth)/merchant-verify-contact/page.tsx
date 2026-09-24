import type { Metadata } from "next";
import { MerchantVerifyContactForm } from "./merchant-verify-contact-form";
import { DEFAULT_OG_IMAGES } from "@/lib/seo";

const title = "Verify Your Business";
const description = "Confirm your contact details to finish setting up your Nexworth merchant portal.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: { title, description, images: DEFAULT_OG_IMAGES },
  twitter: { card: "summary_large_image", title, description, images: DEFAULT_OG_IMAGES },
};

export default function MerchantVerifyContactPage() {
  return <MerchantVerifyContactForm />;
}
