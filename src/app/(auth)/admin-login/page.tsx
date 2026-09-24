import type { Metadata } from "next";
import { AdminLoginForm } from "./admin-login-form";
import { DEFAULT_OG_IMAGES } from "@/lib/seo";

const title = "Admin Sign In";
const description = "Sign in to the Nexworth admin console.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: { title, description, images: DEFAULT_OG_IMAGES },
  twitter: { card: "summary_large_image", title, description, images: DEFAULT_OG_IMAGES },
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
