"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { PageLoader } from "@/components/page-loader";
import { useSession } from "@/hooks/use-session";
import { onboardingStepPath } from "@/lib/onboarding";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    if (user.onboardingStep !== "complete") {
      router.replace(onboardingStepPath(user.onboardingStep));
    }
  }, [loading, user, router]);

  if (loading || !user || user.onboardingStep !== "complete") {
    return <PageLoader />;
  }

  return (
    <PortalShell variant="user" user={user}>
      {children}
    </PortalShell>
  );
}
