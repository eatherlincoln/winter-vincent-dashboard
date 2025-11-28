import React, { useEffect, useState } from "react";
import ThumbnailPicker from "@/components/admin/ThumbnailPicker";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "@/hooks/useAutoRefresh";

type AssetKey = "hero" | "profile";

type AssetState = Record<AssetKey, string>;

export default function BrandAssets() {
  const { tick } = useRefreshSignal();
  const [assets, setAssets] = useState<AssetState>({
    hero: "",
    profile: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("social_media_assets")
        .select("source, thumb_path")
        .in("source", ["hero", "profile"]);
      if (error) {
        console.error("fetch assets failed", error.message);
      } else if (alive) {
        const next = { ...assets };
        for (const row of data ?? []) {
          if (row.source === "hero" || row.source === "profile") {
            next[row.source] = row.thumb_path ?? "";
          }
        }
        setAssets(next);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAsset = (key: AssetKey, val: string) =>
    setAssets((a) => ({ ...a, [key]: val }));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const rows = (["hero", "profile"] as AssetKey[])
        .filter((k) => assets[k].trim().length > 0)
        .map((k) => ({
          source: k,
          thumb_path: assets[k].trim(),
          updated_at: new Date().toISOString(),
        }));
      if (rows.length === 0) {
        setMsg("Add at least one image.");
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("social_media_assets")
        .upsert(rows, { onConflict: "source" });
      if (error) throw error;

      setMsg("Brand images saved ✅");
      tick();
    } catch (e: any) {
      setMsg(e?.message || "Failed to save brand images.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">
          Brand Images (Hero & Profile)
        </h2>
        <button
          onClick={save}
          disabled={saving || loading}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {saving ? "Saving…" : "Save Images"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AssetBlock
          title="Hero Banner"
          value={assets.hero}
          onChange={(v) => setAsset("hero", v)}
        />
        <AssetBlock
          title="Profile Photo"
          value={assets.profile}
          onChange={(v) => setAsset("profile", v)}
        />
      </div>

      {msg && <p className="mt-3 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}

function AssetBlock({
  title,
  value,
  onChange,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-neutral-200 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
      </div>
      <label className="block text-xs font-medium text-neutral-600">
        Image URL (or upload below)
      </label>
      <input
        className="w-full rounded-md border px-3 py-2 text-sm"
        placeholder="https://…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <ThumbnailPicker platform={title.toLowerCase()} value={value} onChange={onChange} />
    </div>
  );
}
