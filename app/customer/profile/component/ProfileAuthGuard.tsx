"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import LoadingPage from "@/components/ui/LoadingPage";

export function ProfileAuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
       <LoadingPage />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            You must be logged in to view this page.
          </p>
          <Link href="/" className="text-brand-color-500 text-sm">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
