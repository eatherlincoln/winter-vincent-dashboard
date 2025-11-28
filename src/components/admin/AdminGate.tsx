import React, { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useNavigate } from "react-router-dom";

type GateState = "checking" | "denied" | "ready";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<GateState>("checking");

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!mounted) return;
      if (!session) {
        navigate("/auth", { replace: true });
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!mounted) return;
      if (error || !profile || profile.role !== "admin") {
        setState("denied");
      } else {
        setState("ready");
      }
    };

    check();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        if (!session) {
          setState("checking");
          navigate("/auth", { replace: true });
        } else {
          check();
        }
      }
    );

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  if (state === "checking") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-50 text-sm text-neutral-600">
        Checking admin access…
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-50 px-6 text-center text-sm text-neutral-700">
        Access denied. Please sign in with an admin account.
      </div>
    );
  }

  return <>{children}</>;
}
