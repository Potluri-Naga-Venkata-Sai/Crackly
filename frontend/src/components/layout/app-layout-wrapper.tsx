"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = ["/", "/about", "/programs", "/login", "/privacy-policy", "/terms"].includes(pathname);

  if (isPublicPage) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <TopHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
