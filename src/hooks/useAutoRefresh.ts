// src/hooks/useAutoRefresh.ts
import { useCallback, useSyncExternalStore } from "react";

/**
 * Tiny global refresh bus that also works across tabs / HMR bundles
 * using BroadcastChannel (when available) and localStorage 'storage' events.
 */

let _version = 0;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function getSnapshot() {
  return _version;
}

// --- Cross-tab wiring ---
let bc: BroadcastChannel | null = null;
try {
  // Safari doesn’t support BroadcastChannel in all versions — so wrap in try/catch
  bc = new BroadcastChannel("winter-refresh-bus");
} catch (_) {
  bc = null;
}

function fanout() {
  // bump local listeners
  _version++;
  for (const l of listeners) l();

  const stamp = Date.now().toString();

  // BroadcastChannel
  try {
    bc?.postMessage(stamp);
  } catch {}

  // localStorage fallback (fires 'storage' in other tabs)
  try {
    localStorage.setItem("__winter_refresh_bus__", stamp);
  } catch {}
}

// listen to BroadcastChannel + storage events
if (bc) {
  bc.onmessage = () => {
    _version++;
    for (const l of listeners) l();
  };
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "__winter_refresh_bus__") {
      _version++;
      for (const l of listeners) l();
    }
  });
}

/** Use this in components that should refetch when admin saves */
export function useRefreshSignal() {
  const v = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // tick now fans out across tabs
  const tick = useCallback(() => {
    fanout();
  }, []);

  return { tick, version: v };
}

/** Optional: simple timer-based refresher if you want periodic pulls */
export function useAutoRefresh(ms = 0) {
  let id: number | null = null;
  const { tick } = useRefreshSignal();
  return {
    start() {
      if (ms > 0 && id == null) id = window.setInterval(tick, ms);
    },
    stop() {
      if (id != null) {
        clearInterval(id);
        id = null;
      }
    },
  };
}
