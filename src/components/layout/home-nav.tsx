'use client';

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";

const HomeNav = () => {
  const { data: session } = useSession();

  return (
    <nav className="border-b">
      <div className="container px-4 mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="font-bold text-xl">
              CFM
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <Navigation />
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HomeNav; 