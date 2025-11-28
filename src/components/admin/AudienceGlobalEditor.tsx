import React, { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "@/hooks/useAutoRefresh";
import { normalizeAudiencePayload } from "@/lib/audience-normalize";

/**
 * Shape we keep in React state while typing (strings for easy input)
 */
type FormState = {
  gender: { men: string; women: string };
  ages: { "18-24": string; "25-34": string; "35-44": string; "45-54": string };
  countries: { label: string; pct: string }[];
  cities: { label: string; pct: string }[];
};

const emptyForm: FormState = {
  gender: { men: "", women: "" },
  ages: { "18-24": "", "25-34": "", "35-44": "", "45-54": "" },
  countries: [
    { label: "", pct: "" },
    { label: "", pct: "" },
    { label: "", pct: "" },
    { label: "", pct: "" },
  ],
  cities: [
    { label: "", pct: "" },
    { label: "", pct: "" },
    { label: "", pct: "" },
    { label: "", pct: "" },
  ],
};

function toStr(n: any) {
  if (n === null || n === undefined) return "";
  const x = Number(n);
  return Number.isFinite(x) ? String(x) : "";
}

export default function AudienceGlobalEditor() {
  const { tick } = useRefreshSignal();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Load existing global row
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        setUserId(userData.user.id);
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("platform_audience")
        .select("*")
        .eq("platform", "instagram")
        .limit(1)
        .maybeSingle();

      if (!alive) return;

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      if (data) {
        const gender_men = toStr(data.gender?.men ?? data.gender_men);
        const gender_women = toStr(data.gender?.women ?? data.gender_women);

        const ages = data.age_groups || data.age_bands || {};
        const countries = Array.isArray(data.countries) ? data.countries : [];
        const cities = Array.isArray(data.cities) ? data.cities : [];

        const next: FormState = {
          gender: { men: gender_men, women: gender_women },
          ages: {
            "18-24": toStr(ages["18-24"] ?? ages["18_24"]),
            "25-34": toStr(ages["25-34"] ?? ages["25_34"]),
            "35-44": toStr(ages["35-44"] ?? ages["35_44"]),
            "45-54": toStr(ages["45-54"] ?? ages["45_54"]),
          },
          countries: [
            {
              label: countries[0]?.label ?? countries[0]?.country ?? "",
              pct: toStr(countries[0]?.pct ?? countries[0]?.percentage),
            },
            {
              label: countries[1]?.label ?? countries[1]?.country ?? "",
              pct: toStr(countries[1]?.pct ?? countries[1]?.percentage),
            },
            {
              label: countries[2]?.label ?? countries[2]?.country ?? "",
              pct: toStr(countries[2]?.pct ?? countries[2]?.percentage),
            },
            {
              label: countries[3]?.label ?? countries[3]?.country ?? "",
              pct: toStr(countries[3]?.pct ?? countries[3]?.percentage),
            },
          ],
          cities: [
            {
              label: cities[0]?.label ?? cities[0]?.city ?? "",
              pct: toStr(cities[0]?.pct ?? cities[0]?.percentage),
            },
            {
              label: cities[1]?.label ?? cities[1]?.city ?? "",
              pct: toStr(cities[1]?.pct ?? cities[1]?.percentage),
            },
            {
              label: cities[2]?.label ?? cities[2]?.city ?? "",
              pct: toStr(cities[2]?.pct ?? cities[2]?.percentage),
            },
            {
              label: cities[3]?.label ?? cities[3]?.city ?? "",
              pct: toStr(cities[3]?.pct ?? cities[3]?.percentage),
            },
          ],
        };

        setForm(next);
      } else {
        // no row; leave empty form
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  // helpers for updating state
  const setGender = (key: "men" | "women", v: string) =>
    setForm((f) => ({ ...f, gender: { ...f.gender, [key]: v } }));

  const setAge = (key: keyof FormState["ages"], v: string) =>
    setForm((f) => ({ ...f, ages: { ...f.ages, [key]: v } }));

  const setCountry = (i: number, key: "label" | "pct", v: string) =>
    setForm((f) => {
      const arr = [...f.countries];
      arr[i] = { ...arr[i], [key]: v };
      return { ...f, countries: arr };
    });

  const setCity = (i: number, key: "label" | "pct", v: string) =>
    setForm((f) => {
      const arr = [...f.cities];
      arr[i] = { ...arr[i], [key]: v };
      return { ...f, cities: arr };
    });

  // SAVE
  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      if (!userId) {
        setMsg("No user session. Please re-login.");
        setSaving(false);
        return;
      }

      // Build a loose object reflecting the form, then normalize
      const raw = {
        gender: { men: form.gender.men, women: form.gender.women },
        ages: {
          "18-24": form.ages["18-24"],
          "25-34": form.ages["25-34"],
          "35-44": form.ages["35-44"],
          "45-54": form.ages["45-54"],
        },
        countries: form.countries.map((c) => ({ label: c.label, pct: c.pct })),
        cities: form.cities.map((c) => ({ label: c.label, pct: c.pct })),
      };

      const normalized = normalizeAudiencePayload(raw);

      const payload = {
        user_id: userId,
        platform: "instagram",
        gender: { men: normalized.gender_men, women: normalized.gender_women },
        age_groups: normalized.age_bands,
        countries: normalized.countries,
        cities: normalized.cities,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("platform_audience")
        .upsert([payload], { onConflict: "user_id,platform" });

      if (error) throw error;

      setMsg("Demographics saved ✅");
      tick();
    } catch (e: any) {
      console.error(e);
      setMsg(e?.message || "Failed to save demographics.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">
          Audience Demographics (Global)
        </h2>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {saving ? "Saving…" : "Save Demographics"}
        </button>
      </div>

      {/* Gender */}
      <section className="mb-6 grid grid-cols-2 gap-4">
        <Field
          label="Men %"
          value={form.gender.men}
          onChange={(v) => setGender("men", v)}
          numeric
        />
        <Field
          label="Women %"
          value={form.gender.women}
          onChange={(v) => setGender("women", v)}
          numeric
        />
      </section>

      {/* Age bands */}
      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Field
          label="18–24 %"
          value={form.ages["18-24"]}
          onChange={(v) => setAge("18-24", v)}
          numeric
        />
        <Field
          label="25–34 %"
          value={form.ages["25-34"]}
          onChange={(v) => setAge("25-34", v)}
          numeric
        />
        <Field
          label="35–44 %"
          value={form.ages["35-44"]}
          onChange={(v) => setAge("35-44", v)}
          numeric
        />
        <Field
          label="45–54 %"
          value={form.ages["45-54"]}
          onChange={(v) => setAge("45-54", v)}
          numeric
        />
      </section>

      {/* Countries */}
      <section className="mb-6">
        <h3 className="mb-2 text-xs font-medium text-neutral-600">
          Top countries
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {form.countries.map((c, i) => (
            <div key={i} className="grid grid-cols-6 gap-2">
              <input
                className="col-span-4 h-9 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
                placeholder={`Country ${i + 1}`}
                value={c.label}
                onChange={(e) => setCountry(i, "label", e.target.value)}
              />
              <input
                className="col-span-2 h-9 w-full rounded-md border border-neutral-300 px-3 text-right text-sm outline-none focus:border-neutral-500"
                placeholder="%"
                inputMode="numeric"
                value={c.pct}
                onChange={(e) => setCountry(i, "pct", e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Cities */}
      <section className="mb-2">
        <h3 className="mb-2 text-xs font-medium text-neutral-600">
          Top cities
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {form.cities.map((c, i) => (
            <div key={i} className="grid grid-cols-6 gap-2">
              <input
                className="col-span-4 h-9 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
                placeholder={`City ${i + 1}`}
                value={c.label}
                onChange={(e) => setCity(i, "label", e.target.value)}
              />
              <input
                className="col-span-2 h-9 w-full rounded-md border border-neutral-300 px-3 text-right text-sm outline-none focus:border-neutral-500"
                placeholder="%"
                inputMode="numeric"
                value={c.pct}
                onChange={(e) => setCity(i, "pct", e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {msg && <p className="mt-4 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}

/** Small input primitive used above */
function Field({
  label,
  value,
  onChange,
  numeric,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  numeric?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-600">
        {label}
      </span>
      <input
        className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
        placeholder="0"
        inputMode={numeric ? "numeric" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
