"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { SessionUser } from "@/lib/types";

export function PortalShell({
  variant,
  user,
  children,
}: {
  variant: "user" | "admin" | "merchant";
  user: SessionUser;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar variant={variant} open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={user} onMenuClick={() => setMobileNavOpen(true)} />
        {/* Padding lives on this inner div rather than on `main` itself —
            padding on the scrolling element is a well-known blocker for
            `position: sticky` children (their `top: 0` sticks flush to
            the scroll container's *padding* edge, leaving a permanent
            gap). Keeping `main` padding-free lets sticky content (e.g.
            Find Merchants' filter bar) sit flush under the topbar. */}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
