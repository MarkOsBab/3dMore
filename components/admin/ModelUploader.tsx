"use client";

import { useState } from "react";
import { Upload, CheckCircle, Loader, Box } from "lucide-react";

interface Props {
  onUploaded: (url: string, format: string) => void;
  bucket?: string;
}

export function ModelUploader({ onUploaded, bucket = "products" }: Props) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setFileName(file.name);
    setErrorMsg(null);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("bucket", bucket);
      form.append("kind", "model");

      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Upload failed");
      }
      const { url, format } = await res.json();
      onUploaded(url, format);
      setStatus("done");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al subir";
      setErrorMsg(msg);
      setStatus("error");
    }
  };

  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.75rem 1rem",
        border: `1px dashed ${
          status === "done" ? "#22c55e" : status === "error" ? "#ef4444" : "rgba(255,255,255,0.2)"
        }`,
        borderRadius: 8,
        cursor: "pointer",
        backgroundColor: "rgba(255,255,255,0.03)",
      }}
    >
      <input
        type="file"
        accept=".stl,.glb,.gltf,model/stl,model/gltf-binary,model/gltf+json"
        onChange={handleFile}
        style={{ display: "none" }}
      />
      {status === "idle" && (
        <>
          <Box size={18} style={{ color: "var(--text-secondary)" }} />
          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Subir modelo 3D (.stl, .glb, .gltf)</span>
        </>
      )}
      {status === "uploading" && (
        <>
          <Loader size={18} style={{ color: "var(--accent-blue)", animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: "0.9rem" }}>Subiendo {fileName}…</span>
        </>
      )}
      {status === "done" && (
        <>
          <CheckCircle size={18} style={{ color: "#22c55e" }} />
          <span style={{ color: "#22c55e", fontSize: "0.9rem" }}>Modelo cargado ✓</span>
        </>
      )}
      {status === "error" && (
        <>
          <Upload size={18} style={{ color: "#ef4444" }} />
          <span style={{ color: "#ef4444", fontSize: "0.85rem" }}>{errorMsg ?? "Error al subir"}</span>
        </>
      )}
    </label>
  );
}
