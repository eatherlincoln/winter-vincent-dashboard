// src/components/AudienceDemographics.tsx
import React, { useMemo } from "react";
import { usePlatformAudience } from "@/hooks";
import { MapPin, Users } from "lucide-react";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers

const clampPct = (n: any) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
};

/** Accept 31, "31", "31%" → 31 */
const parsePct = (x: any) => {
  if (x == null) return 0;
  if (typeof x === "number") return clampPct(x);
  if (typeof x === "string") {
    const m = x.match(/-?\d+(\.\d+)?/);
    return clampPct(m ? Number(m[0]) : 0);
  }
  return 0;
};

/** ISO2 → emoji flag (e.g., "AU" → 🇦🇺) */
const flagFromIso2 = (iso2: string) =>
  iso2
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join("");

/** name → ISO2 (extend anytime) */
const ISO2_BY_NAME: Record<string, string> = {
  australia: "AU",
  "united states": "US",
  usa: "US",
  japan: "JP",
  brazil: "BR",
  "united kingdom": "GB",
  uk: "GB",
  canada: "CA",
  germany: "DE",
  france: "FR",
  italy: "IT",
  spain: "ES",
  "new zealand": "NZ",
};

const countryFlag = (name: string) => {
  const iso =
    ISO2_BY_NAME[name.toLowerCase()] ?? (name.length === 2 ? name : "");
  return iso ? flagFromIso2(iso) : "🌐";
};

/** read an age band value from multiple possible keys */
function getAge(a: any, dash: string, underscore: string) {
  if (!a) return 0;
  const v =
    a?.[dash] ??
    a?.[underscore] ??
    a?.[dash.replace("–", "-")] ??
    a?.[underscore.replace("–", "_")];
  return parsePct(v);
}

/** Turn unknown collection into an array */
function toArraySafe(x: any): Array<any> {
  if (Array.isArray(x)) return x;
  if (x && typeof x === "object")
    return Object.entries(x).map(([k, v]) => ({ label: k, pct: v as any }));
  if (typeof x === "string")
    return x.trim() ? [{ label: x.trim(), pct: 0 }] : [];
  return [];
}

/** Normalize locations → [{label, pct}] */
function normList(arr?: any[]) {
  const list = toArraySafe(arr);
  return list
    .map((it) => {
      const rawLabel =
        it?.country ??
        it?.city ??
        it?.label ??
        it?.name ??
        it?.title ??
        (typeof it === "string" ? it : "");
      const rawPct =
        it?.percentage ??
        it?.pct ??
        it?.value ??
        (typeof it === "number" ? it : 0);

      const label = String(rawLabel || "").trim();
      const pct = parsePct(rawPct);
      return label ? { label, pct } : null;
    })
    .filter(Boolean) as { label: string; pct: number }[];
}

function fmtDate(ts?: string | Date | null) {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// simple progress bar
function Bar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-2 w-full rounded-full bg-neutral-100 ${className}`}>
      <div
        className="h-2 rounded-full bg-teal-500 transition-[width]"
        style={{ width: `${clampPct(value)}%` }}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Component

export default function AudienceDemographics() {
  const { audience, loading } = usePlatformAudience(); // expects global audience

  const data = useMemo(() => {
    const root = audience ?? {};

    // Gender
    const g = root.gender ?? root;
    let men = parsePct(g?.men ?? g?.gender_men);
    let women = parsePct(g?.women ?? g?.gender_women);
    if (!women && men) women = clampPct(100 - men);
    if (!men && women) men = clampPct(100 - women);

    // Ages
    const agesSrc = root.age_bands ?? root.age_groups ?? root.ages ?? {};
    const ages = {
      "25–34": getAge(agesSrc, "25-34", "25_34"),
      "18–24": getAge(agesSrc, "18-24", "18_24"),
      "35–44": getAge(agesSrc, "35-44", "35_44"),
      "45–54": getAge(agesSrc, "45-54", "45_54"),
    };

    // Locations
    const countries = normList(root.countries ?? root.top_countries);
    const cities = normList(root.cities ?? root.top_cities);

    const updatedAt = root.updated_at ?? root.updatedAt ?? null;

    return { men, women, ages, countries, cities, updatedAt };
  }, [audience]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-neutral-600">Loading audience…</p>
      </div>
    );
  }

  const { men, women, ages, countries, cities, updatedAt } = data;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">
          Audience Demographics
        </h2>
        {updatedAt && (
          <span className="text-xs text-neutral-500">
            Updated {fmtDate(updatedAt)}
          </span>
        )}
      </div>

      {/* Gender */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700">
          <Users size={16} />
          Gender Split
        </div>
        <div className="relative">
          <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-3 bg-sky-600"
              style={{ width: `${clampPct(men)}%` }}
            />
            <div
              className="h-3 bg-pink-500"
              style={{ width: `${clampPct(women)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-neutral-600">
            <span>{clampPct(men)}% Men</span>
            <span>{clampPct(women)}% Women</span>
          </div>
        </div>
      </div>

      {/* Ages */}
      <div className="mb-6">
        <div className="mb-3 text-sm font-medium text-neutral-700">
          Age Groups
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(ages).map(([label, pct]) => (
            <div
              key={label}
              className="rounded-xl border border-neutral-200 p-4"
            >
              <div className="mb-2 text-sm font-medium text-neutral-700">
                {label}
              </div>
              <Bar value={pct} />
              <div className="mt-2 text-sm font-semibold text-neutral-900">
                {clampPct(pct)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Locations */}
      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-700">
          <MapPin size={16} />
          Top Locations
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Countries */}
          <section className="rounded-xl border border-neutral-200 p-4">
            <div className="mb-3 text-sm font-medium text-neutral-700">
              Top countries
            </div>
            <ul className="space-y-2">
              {countries.length ? (
                countries.map((c, i) => (
                  <li
                    key={`${c.label}-${i}`}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 text-sm"
                  >
                    <span className="text-neutral-800">
                      <span className="mr-2">{countryFlag(c.label)}</span>
                      {c.label}
                    </span>
                    <span className="font-medium text-neutral-900">
                      {clampPct(c.pct)}%
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-neutral-500">No countries</li>
              )}
            </ul>
          </section>

          {/* Cities */}
          <section className="rounded-xl border border-neutral-200 p-4">
            <div className="mb-3 text-sm font-medium text-neutral-700">
              Top cities
            </div>
            <ul className="space-y-2">
              {cities.length ? (
                cities.map((c, i) => (
                  <li
                    key={`${c.label}-${i}`}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 text-sm"
                  >
                    <span className="text-neutral-800">{c.label}</span>
                    {/* If pct missing it will render 0%, which is fine.
                        If you prefer no number when 0, wrap with a conditional */}
                    <span className="font-medium text-neutral-900">
                      {clampPct(c.pct)}%
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-neutral-500">No cities</li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
