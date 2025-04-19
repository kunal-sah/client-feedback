'use client';

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { SuperAdminNav } from "@/components/super-admin/nav";
import { UserNav } from "@/components/layout/user-nav";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-background border-r p-6">
        <div className="mb-8">
          <h2 className="text-lg font-semibold">Super Admin</h2>
        </div>
        <SuperAdminNav />
      </div>
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b px-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Client Feedback Monthly</h1>
          <UserNav />
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 