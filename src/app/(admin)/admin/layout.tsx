"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { PageLoader } from "@/components/page-loader";
import { useSession } from "@/hooks/use-session";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== "admin") {
    return <PageLoader />;
  }

  return (
    <PortalShell variant="admin" user={user}>
      {children}
    </PortalShell>
  );
}
