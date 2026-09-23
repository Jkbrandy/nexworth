"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { PageLoader } from "@/components/page-loader";
import { useSession } from "@/hooks/use-session";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    if (user.role !== "merchant") {
      router.replace("/dashboard");
      return;
    }
    if (!user.merchantContactVerified) {
      router.replace("/merchant-verify-contact");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== "merchant" || !user.merchantContactVerified) {
    return <PageLoader />;
  }

  return (
    <PortalShell variant="merchant" user={user}>
      {user.merchantStatus && user.merchantStatus !== "active" && (
        <div className="mx-auto mb-6 flex max-w-8xl items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-amber-600">
          <Clock className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">
              {user.merchantStatus === "pending"
                ? "Your application is under review."
                : user.merchantStatus === "rejected"
                  ? "Your application was not approved."
                  : "Your account is currently suspended."}
            </p>
            <p className="mt-0.5 text-amber-600/80">
              {user.merchantStatus === "pending"
                ? "You can explore your portal now, but adding discount codes is disabled until our team approves your listing."
                : "Contact Nexworth support if you think this is a mistake."}
            </p>
          </div>
        </div>
      )}
      {children}
    </PortalShell>
  );
}
