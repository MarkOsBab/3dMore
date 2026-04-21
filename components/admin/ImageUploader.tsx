"use client";

import { useState } from "react";
import { Upload, CheckCircle, Loader } from "lucide-react";

interface Props {
  onUploaded: (url: string) => void;
  bucket?: string;
}

export function ImageUploader({ onUploaded, bucket = "products" }: Props) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setPreview(URL.createObjectURL(file));

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("bucket", bucket);

      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Upload failed");
      }
      const { url } = await res.json();
      onUploaded(url);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <label style={{
      display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem",
      border: `1px dashed ${status === "done" ? "#22c55e" : status === "error" ? "#ef4444" : "rgba(255,255,255,0.2)"}`,
      borderRadius: "8px", cursor: "pointer", transition: "all 0.2s",
      backgroundColor: "rgba(255,255,255,0.03)"
    }}>
      <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      {status === "idle" && <><Upload size={18} style={{ color: "var(--text-secondary)" }} /><span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Subir imagen</span></>}
      {status === "uploading" && <><Loader size={18} style={{ color: "var(--accent-blue)", animation: "spin 1s linear infinite" }} /><span style={{ fontSize: "0.9rem" }}>Subiendo...</span></>}
      {status === "done" && <><CheckCircle size={18} style={{ color: "#22c55e" }} /><span style={{ color: "#22c55e", fontSize: "0.9rem" }}>Imagen cargada ✓</span></>}
      {status === "error" && <span style={{ color: "#ef4444", fontSize: "0.9rem" }}>Error al subir, intentá de nuevo.</span>}
    </label>
  );
}
