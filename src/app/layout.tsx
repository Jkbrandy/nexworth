import type { Metadata } from "next";
import { Rethink_Sans, Geist_Mono } from "next/font/google";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToastContainer } from "@/components/theme-toast-container";
import { SessionExpiryModal } from "@/components/session-expiry-modal";
import { SessionProvider } from "@/hooks/use-session";
import { DEFAULT_OG_IMAGES, SITE_NAME } from "@/lib/seo";

const rethinkSans = Rethink_Sans({
  variable: "--font-rethink-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "A trusted access and opportunity platform for young people across Ghana and the UK.",
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    images: DEFAULT_OG_IMAGES,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${rethinkSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <SessionProvider>
            {children}
            <ThemeToastContainer />
            <SessionExpiryModal />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
