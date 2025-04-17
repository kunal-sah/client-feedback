import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Nav } from "@/components/nav";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/footer";
import { ErrorBoundary } from "@/components/error-boundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Client Feedback Monthly",
  description: "Monthly client feedback management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <Providers>
          <ErrorBoundary>
            <div className="relative flex min-h-screen flex-col">
              <Nav />
              <div className="flex-1">
                <main className="container mx-auto px-4 py-8">
                  {children}
                </main>
              </div>
              <Footer />
            </div>
            <Toaster />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
} 