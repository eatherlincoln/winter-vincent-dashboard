import React, { useRef, useState } from "react";
import { supabase } from "@supabaseClient";

type Props = {
  platform: "instagram" | "youtube" | "tiktok";
  value?: string;
  onChange?: (publicUrl: string) => void;
};

export default function ThumbnailPicker({ platform, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    try {
      setUploading(true);
      const ext = file.name.split(".").pop() || "jpg";
      const name = `${platform}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("thumbnails")
        .upload(name, file, {
          upsert: false,
        });
      if (error) throw error;
      const { data } = supabase.storage.from("thumbnails").getPublicUrl(name);
      if (data?.publicUrl) {
        onChange?.(data.publicUrl);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="h-12 w-20 overflow-hidden rounded border bg-neutral-50">
        <img
          src={value || "/winter-avatar.svg"}
          className="h-full w-full object-cover"
          alt=""
        />
      </div>
      <div>
        <button
          type="button"
          className="rounded border px-3 py-1.5 text-sm hover:bg-neutral-50"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading…" : "Upload thumbnail"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>
    </div>
  );
}
