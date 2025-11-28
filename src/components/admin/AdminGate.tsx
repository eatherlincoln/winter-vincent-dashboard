import React, { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session) {
        navigate("/auth", { replace: true });
      } else {
        setReady(true);
      }
    };

    hydrate();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        if (!session) {
          navigate("/auth", { replace: true });
        } else {
          setReady(true);
        }
      }
    );

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-50 text-sm text-neutral-600">
        Checking auth…
      </div>
    );
  }

  return <>{children}</>;
}
