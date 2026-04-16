"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { setTokens } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";

function TokenSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces);

  useEffect(() => {
    if (status === "authenticated" && session) {
      // Sync backend tokens from NextAuth JWT to localStorage
      const s = session as unknown as Record<string, unknown>;
      const accessToken = s.accessToken as string | undefined;
      const refreshToken = s.refreshToken as string | undefined;
      if (accessToken && refreshToken) {
        setTokens(accessToken, refreshToken);
      }
      // Fetch workspaces after successful auth
      fetchWorkspaces();
    }
  }, [status, session, fetchWorkspaces]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TokenSync>
        {children}
      </TokenSync>
    </SessionProvider>
  );
}
