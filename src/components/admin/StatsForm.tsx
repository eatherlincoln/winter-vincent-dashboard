import React, { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "@/hooks/useAutoRefresh";
import { BarChart2, Instagram, Youtube, Music2 } from "lucide-react";

type Platform = "instagram" | "youtube" | "tiktok";

type StatRowUI = {
  platform: Platform;
  followers: string; // raw string for input
  monthly_views: string; // raw string for input
  engagement: string; // raw string for input (we still allow manual edits)
};

const PLATFORMS: Platform[] = ["instagram", "youtube", "tiktok"];

const emptyRow = (platform: Platform): StatRowUI => ({
  platform,
  followers: "",
  monthly_views: "",
  engagement: "",
});

const toInt = (v: string): number | null => {
  const s = (v ?? "").trim();
  if (!s) return null;
  const n = Number(s.replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : null;
};

const toFloat = (v: string): number | null => {
  const s = (v ?? "").trim();
  if (!s) return null;
  const n = Number(s.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
};

export default function StatsForm() {
  const { tick } = useRefreshSignal();

  const [rows, setRows] = useState<Record<Platform, StatRowUI>>({
    instagram: emptyRow("instagram"),
    youtube: emptyRow("youtube"),
    tiktok: emptyRow("tiktok"),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Load current stats
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("platform_stats")
        .select("*")
        .in("platform", PLATFORMS);

      if (error) {
        console.error(error.message);
        setLoading(false);
        return;
      }
      if (!alive) return;

      const next = { ...rows };
      for (const p of PLATFORMS) {
        const hit = (data || []).find((d: any) => d.platform === p);
        if (hit) {
          next[p] = {
            platform: p,
            followers: (hit.followers ?? "").toString(),
            monthly_views: (hit.monthly_views ?? "").toString(),
            engagement: (hit.engagement ?? "").toString(),
          };
        }
      }
      setRows(next);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (
    platform: Platform,
    key: keyof Omit<StatRowUI, "platform">,
    val: string
  ) => {
    setRows((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], [key]: val },
    }));
  };

  const saveAll = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const timestamp = new Date().toISOString();
      const payload = PLATFORMS.map((p) => ({
        platform: p,
        followers: toInt(rows[p].followers),
        monthly_views: toInt(rows[p].monthly_views),
        engagement: toFloat(rows[p].engagement), // optional; admin may type or leave blank
        updated_at: timestamp,
      }));

      const { error } = await supabase
        .from("platform_stats")
        .upsert(payload, { onConflict: "platform" });

      if (error) throw error;

      setMsg("Metrics saved ✅");
      tick(); // refresh public KPIs
    } catch (e: any) {
      setMsg(e?.message || "Failed to save metrics.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-50">
            <BarChart2 size={16} className="text-neutral-700" />
          </span>
          <h2 className="text-sm font-semibold text-neutral-900">
            Platform Metrics
          </h2>
        </div>
        <button
          onClick={saveAll}
          disabled={saving || loading}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PlatformCard
          icon={<Instagram size={16} className="text-pink-600" />}
          title="Instagram"
          row={rows.instagram}
          onChange={setField}
          disabled={loading}
        />
        <PlatformCard
          icon={<Youtube size={16} className="text-red-600" />}
          title="YouTube"
          row={rows.youtube}
          onChange={setField}
          disabled={loading}
        />
        <PlatformCard
          icon={<Music2 size={16} className="text-emerald-600" />}
          title="TikTok"
          row={rows.tiktok}
          onChange={setField}
          disabled={loading}
        />
      </div>

      {msg && <p className="mt-4 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}

function PlatformCard({
  icon,
  title,
  row,
  onChange,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  row: StatRowUI;
  onChange: (
    platform: Platform,
    key: keyof Omit<StatRowUI, "platform">,
    val: string
  ) => void;
  disabled?: boolean;
}) {
  return (
    <section className="rounded-xl border border-neutral-200 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-50">
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
      </div>

      <div className="space-y-3">
        <Field
          label="Followers"
          placeholder="e.g. 38700"
          value={row.followers}
          onChange={(v) => onChange(row.platform, "followers", v)}
          disabled={disabled}
          alignRight
        />
        <Field
          label="Monthly views"
          placeholder="e.g. 730000"
          value={row.monthly_views}
          onChange={(v) => onChange(row.platform, "monthly_views", v)}
          disabled={disabled}
          alignRight
        />
        <Field
          label="Engagement"
          placeholder="e.g. 2.01"
          suffix="%"
          value={row.engagement}
          onChange={(v) => onChange(row.platform, "engagement", v)}
          disabled={disabled}
          alignRight
        />
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  disabled,
  alignRight,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  disabled?: boolean;
  alignRight?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-600">
        {label}
      </span>
      <div className="relative">
        <input
          type="text"
          className={[
            "h-9 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500",
            alignRight ? "pr-8 text-right" : "",
          ].join(" ")}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}
