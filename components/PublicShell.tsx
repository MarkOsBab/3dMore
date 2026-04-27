"use client";

import { usePathname } from "next/navigation";
import WhatsAppFab from "@/components/WhatsAppFab";
import CookieBanner from "@/components/CookieBanner";

const HIDE_FAB_PATHS = ["/checkout", "/admin"];

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const showFab = !HIDE_FAB_PATHS.some((p) => pathname.startsWith(p));

  return (
    <>
      {children}
      {showFab && <WhatsAppFab />}
      <CookieBanner />
    </>
  );
}
