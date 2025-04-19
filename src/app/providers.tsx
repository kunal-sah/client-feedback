'use client';

import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationsProvider } from "@/contexts/notifications-context";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <NotificationsProvider>
          {children}
          <Toaster />
        </NotificationsProvider>
      </AuthProvider>
    </SessionProvider>
  );
} 