"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Box, X, Plus, Trash2, Pencil, Check, GripVertical, Palette, Camera, Save,
  RotateCw, Move3d, Maximize,
} from "lucide-react";
import { ModelUploader } from "./ModelUploader";
import type { ViewerHandle, CameraView } from "../ProductModelViewer";

const ProductModelViewer = dynamic(() => import("../ProductModelViewer"), { ssr: false });

interface Color {
  id: string;
  name: string;
  hex: string;
  isActive: boolean;
}

interface Part {
  id: string;
  name: string;
  modelUrl: string;
  format: string;
  positionX: number; positionY: number; positionZ: number;
  rotationX: number; rotationY: number; rotationZ: number;
  scale: number;
  defaultColorId: string | null;
  defaultColor: Color | null;
}

interface Props {
  productId: string;
  productName: string;
  initialYaw?: number;
  initialPitch?: number;
  initialZoom?: number;
  initialTargetX?: number;
  initialTargetY?: number;
  initialTargetZ?: number;
  onClose: () => void;
  onSaved: () => void;
}

export default function PartsForm({
  productId,
  productName,
  initialYaw = 0,
  initialPitch = 0,
  initialZoom = 3,
  initialTargetX = 0,
  initialTargetY = 0,
  initialTargetZ = 0,
  onClose,
  onSaved,
}: Props) {
  const [parts, setParts] = useState<Part[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);

  // create form state
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newFormat, setNewFormat] = useState("");
  const [newColorId, setNewColorId] = useState<string>("");
  const [creating, setCreating] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [partsRes, colorsRes] = await Promise.all([
      fetch(`/api/admin/parts?productId=${productId}`),
      fetch("/api/admin/colors"),
    ]);
    const partsData  = partsRes.ok  ? await partsRes.json()  : [];
    const colorsData = colorsRes.ok ? await colorsRes.json() : [];
    setParts(partsData);
    setColors(colorsData);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [productId]);

  const activeColors = useMemo(() => colors.filter((c) => c.isActive), [colors]);

  // ── Viewer preview state ────────────────────────────────────────────────
  const viewerHandleRef = useRef<ViewerHandle | null>(null);
  const [savedView, setSavedView] = useState<CameraView>({
    yaw: initialYaw, pitch: initialPitch, zoom: initialZoom,
    targetX: initialTargetX, targetY: initialTargetY, targetZ: initialTargetZ,
  });
  const [viewerKey, setViewerKey] = useState(0); // remount to re-apply initialView
  const [savingView, setSavingView] = useState(false);

  // Live preview overrides for the part currently being edited (merged into parts list)
  const [liveOverrides, setLiveOverrides] = useState<Record<string, Partial<Part>>>({});

  const mergedParts = useMemo(() => {
    return parts.map((p) => (liveOverrides[p.id] ? { ...p, ...liveOverrides[p.id] } : p));
  }, [parts, liveOverrides]);

  // Build a preview parts + colors map that uses each part's default color
  const previewPartColors = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of mergedParts) {
      const override = liveOverrides[p.id];
      // If user changed defaultColorId in the live override, resolve it via colors list
      const colorId = override && "defaultColorId" in override
        ? (override.defaultColorId ?? null)
        : p.defaultColorId;
      const hex = colorId ? colors.find((c) => c.id === colorId)?.hex : p.defaultColor?.hex;
      map[p.id] = hex ?? "#cccccc";
    }
    return map;
  }, [mergedParts, liveOverrides, colors]);

  const handleSaveView = async () => {
    const h = viewerHandleRef.current;
    if (!h) return;
    const current = h.getCurrentView();
    setSavingView(true);
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        viewerYaw: current.yaw,
        viewerPitch: current.pitch,
        viewerZoom: current.zoom,
        viewerTargetX: current.targetX ?? 0,
        viewerTargetY: current.targetY ?? 0,
        viewerTargetZ: current.targetZ ?? 0,
      }),
    });
    setSavingView(false);
    if (res.ok) {
      setSavedView(current);
      onSaved();
    } else {
      alert("No se pudo guardar la vista");
    }
  };

  const handleResetView = () => {
    setSavedView({ yaw: 0, pitch: 0, zoom: 3, targetX: 0, targetY: 0, targetZ: 0 });
    setViewerKey((k) => k + 1);
  };

  const handleRecenter = () => {
    viewerHandleRef.current?.recenter();
  };

  const handleFit = () => {
    viewerHandleRef.current?.fitToScene(1.3);
  };
  // ────────────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!newName.trim() || !newUrl || !newFormat) return;
    setCreating(true);
    const res = await fetch("/api/admin/parts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        name: newName.trim(),
        modelUrl: newUrl,
        format: newFormat,
        defaultColorId: newColorId || null,
      }),
    });
    setCreating(false);
    if (res.ok) {
      setNewName("");
      setNewUrl("");
      setNewFormat("");
      setNewColorId("");
      await load();
      onSaved();
    }
  };

  const updatePart = async (id: string, data: Partial<Part>) => {
    await fetch(`/api/admin/parts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await load();
    onSaved();
  };

  const deletePart = async (id: string) => {
    if (!confirm("¿Eliminar esta parte?")) return;
    await fetch(`/api/admin/parts/${id}`, { method: "DELETE" });
    await load();
    onSaved();
  };

  // DnD
  const dragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDrop = async (targetId: string) => {
    const fromId = dragId.current;
    dragId.current = null;
    setDragOverId(null);
    if (!fromId || fromId === targetId) return;
    const list = [...parts];
    const fromIdx = list.findIndex((p) => p.id === fromId);
    const toIdx   = list.findIndex((p) => p.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);
    setParts(list);
    await fetch("/api/admin/parts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: list.map((p) => p.id) }),
    });
    onSaved();
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div className="admin-modal-enter" style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={iconBoxStyle}>
              <Box size={18} color="var(--accent-pink)" />
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Partes 3D</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 2 }}>
                {productName}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={closeBtnStyle}><X size={18} /></button>
        </div>

        {/* Create */}
        <div className="glass" style={sectionStyle}>
          <p style={sectionLabelStyle}>Agregar parte</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input
              className="admin-input"
              placeholder="Nombre (ej: Oreja izquierda, Base, Detalle…)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            {newUrl ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                <Check size={14} color="#22c55e" />
                <span style={{ fontFamily: "monospace" }}>{newFormat.toUpperCase()}</span>
                <span style={{ opacity: 0.6 }}>·</span>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{newUrl.split("/").pop()}</span>
                <button onClick={() => { setNewUrl(""); setNewFormat(""); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <ModelUploader onUploaded={(url, format) => { setNewUrl(url); setNewFormat(format); }} />
            )}

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Palette size={14} color="var(--text-muted)" />
              <select
                className="admin-input"
                value={newColorId}
                onChange={(e) => setNewColorId(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">Color por defecto (opcional)</option>
                {activeColors.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {newColorId && (
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: colors.find((c) => c.id === newColorId)?.hex ?? "#000",
                  border: "1px solid rgba(255,255,255,0.15)",
                }} />
              )}
            </div>

            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim() || !newUrl}
              style={{
                padding: "0.6rem 1.2rem", background: "var(--accent-pink)", color: "white",
                border: "none", borderRadius: "var(--radius-pill)", fontWeight: 600,
                cursor: creating || !newName.trim() || !newUrl ? "not-allowed" : "pointer",
                opacity: creating || !newName.trim() || !newUrl ? 0.5 : 1,
                display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start",
                fontSize: "0.88rem",
              }}
            >
              <Plus size={15} /> {creating ? "Agregando…" : "Agregar parte"}
            </button>
          </div>
        </div>

        {/* List */}
        <div style={sectionStyle}>
          <p style={sectionLabelStyle}>Partes ({parts.length})</p>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
              <div className="spinner" style={{ width: 24, height: 24 }} />
            </div>
          ) : parts.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textAlign: "center", padding: "1.5rem 0" }}>
              No hay partes aún. Agregá la primera arriba.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {parts.map((p) => (
                <PartRow
                  key={p.id}
                  part={p}
                  colors={activeColors}
                  isOpen={editId === p.id}
                  isDragOver={dragOverId === p.id}
                  onOpen={() => {
                    const next = editId === p.id ? null : p.id;
                    setEditId(next);
                    // Clear any live override when closing edit row
                    if (next === null) {
                      setLiveOverrides((prev) => {
                        const { [p.id]: _, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  onDragStart={() => { dragId.current = p.id; }}
                  onDragOver={(e) => { e.preventDefault(); if (dragId.current !== p.id) setDragOverId(p.id); }}
                  onDrop={() => handleDrop(p.id)}
                  onDragEnd={() => { dragId.current = null; setDragOverId(null); }}
                  onUpdate={(data) => {
                    // Clear the live override for this part since the saved state now matches
                    setLiveOverrides((prev) => {
                      const { [p.id]: _, ...rest } = prev;
                      return rest;
                    });
                    updatePart(p.id, data);
                  }}
                  onLiveChange={(data) => {
                    setLiveOverrides((prev) => ({ ...prev, [p.id]: { ...prev[p.id], ...data } }));
                  }}
                  onDelete={() => deletePart(p.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Vista inicial 3D */}
        {parts.length > 0 && (
          <div className="glass" style={sectionStyle}>
            <p style={sectionLabelStyle}>Vista inicial del visor</p>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.75rem", lineHeight: 1.5 }}>
              Rotá y alejá/acercá el modelo hasta la posición ideal y presioná <strong>Guardar vista</strong>. Así se mostrará por defecto en la ficha pública del producto.
            </p>

            <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "0.75rem" }}>
              <ProductModelViewer
                key={viewerKey}
                parts={mergedParts.map((p) => ({
                  id: p.id,
                  name: p.name,
                  modelUrl: p.modelUrl,
                  format: p.format,
                  positionX: p.positionX, positionY: p.positionY, positionZ: p.positionZ,
                  rotationX: p.rotationX, rotationY: p.rotationY, rotationZ: p.rotationZ,
                  scale: p.scale,
                }))}
                partColors={previewPartColors}
                height={360}
                initialView={savedView}
                onReady={(h) => { viewerHandleRef.current = h; }}
                showHint
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleSaveView}
                disabled={savingView}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "0.55rem 1rem", background: "var(--accent-pink)", color: "white",
                  border: "none", borderRadius: "var(--radius-pill)", fontWeight: 600,
                  cursor: savingView ? "not-allowed" : "pointer",
                  opacity: savingView ? 0.5 : 1,
                  fontSize: "0.85rem",
                }}
              >
                <Save size={14} /> {savingView ? "Guardando…" : "Guardar vista actual"}
              </button>
              <button
                type="button"
                onClick={handleFit}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "0.55rem 1rem", background: "transparent", color: "var(--text-secondary)",
                  border: "1px solid rgba(255,255,255,0.12)", borderRadius: "var(--radius-pill)",
                  cursor: "pointer", fontSize: "0.85rem",
                }}
                title="Encuadra todo el modelo en la pantalla"
              >
                <Maximize size={14} /> Encuadrar
              </button>
              <button
                type="button"
                onClick={handleRecenter}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "0.55rem 1rem", background: "transparent", color: "var(--text-secondary)",
                  border: "1px solid rgba(255,255,255,0.12)", borderRadius: "var(--radius-pill)",
                  cursor: "pointer", fontSize: "0.85rem",
                }}
                title="Vuelve a centrar el modelo sin perder la rotación actual"
              >
                <Move3d size={14} /> Centrar modelo
              </button>
              <button
                type="button"
                onClick={handleResetView}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "0.55rem 1rem", background: "transparent", color: "var(--text-secondary)",
                  border: "1px solid rgba(255,255,255,0.12)", borderRadius: "var(--radius-pill)",
                  cursor: "pointer", fontSize: "0.85rem",
                }}
              >
                <Camera size={14} /> Restablecer a frontal
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button type="button" onClick={onClose} style={secondaryBtnStyle}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function PartRow({
  part, colors, isOpen, isDragOver, onOpen, onUpdate, onDelete, onLiveChange,
  onDragStart, onDragOver, onDrop, onDragEnd,
}: {
  part: Part;
  colors: Color[];
  isOpen: boolean;
  isDragOver: boolean;
  onOpen: () => void;
  onUpdate: (data: Partial<Part>) => void;
  onLiveChange?: (data: Partial<Part>) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const [name, setName] = useState(part.name);
  const [colorId, setColorId] = useState(part.defaultColorId ?? "");

  const [px, setPx] = useState(part.positionX);
  const [py, setPy] = useState(part.positionY);
  const [pz, setPz] = useState(part.positionZ);
  const [rx, setRx] = useState(part.rotationX);
  const [ry, setRy] = useState(part.rotationY);
  const [rz, setRz] = useState(part.rotationZ);
  const [scale, setScale] = useState(part.scale);

  useEffect(() => {
    setName(part.name);
    setColorId(part.defaultColorId ?? "");
    setPx(part.positionX); setPy(part.positionY); setPz(part.positionZ);
    setRx(part.rotationX); setRy(part.rotationY); setRz(part.rotationZ);
    setScale(part.scale);
  }, [part]);

  // Keep a stable ref to onLiveChange so it never triggers the effect itself.
  const onLiveChangeRef = useRef(onLiveChange);
  useEffect(() => { onLiveChangeRef.current = onLiveChange; });

  // Emit live changes to parent whenever any editable field mutates (only while open)
  useEffect(() => {
    if (!isOpen || !onLiveChangeRef.current) return;
    onLiveChangeRef.current({
      name,
      defaultColorId: colorId || null,
      positionX: px, positionY: py, positionZ: pz,
      rotationX: rx, rotationY: ry, rotationZ: rz,
      scale,
    });
  }, [isOpen, name, colorId, px, py, pz, rx, ry, rz, scale]);

  const save = () => {
    onUpdate({
      name,
      defaultColorId: colorId || null,
      positionX: px, positionY: py, positionZ: pz,
      rotationX: rx, rotationY: ry, rotationZ: rz,
      scale,
    });
  };

  return (
    <div
      draggable={!isOpen}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className="glass"
      style={{
        borderRadius: "var(--radius-md)",
        border: `1px solid ${isDragOver ? "rgba(255,42,133,0.5)" : "rgba(255,255,255,0.06)"}`,
        background: isDragOver ? "rgba(255,42,133,0.06)" : undefined,
      }}
    >
      <div style={{ padding: "0.8rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <GripVertical size={14} color="var(--text-muted)" style={{ flexShrink: 0, cursor: "grab" }} />

        <div
          style={{
            width: 28, height: 28, borderRadius: 6, flexShrink: 0,
            background: part.defaultColor?.hex ?? "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.92rem", fontWeight: 500 }}>{part.name}</div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
            {part.format.toUpperCase()} · scale {part.scale.toFixed(2)}
          </div>
        </div>

        <button onClick={onOpen} title="Editar" style={iconBtn("var(--text-secondary)")}>
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} title="Eliminar" style={iconBtn("var(--danger)")}>
          <Trash2 size={14} />
        </button>
      </div>

      {isOpen && (
        <div style={{ padding: "0 1rem 1rem", display: "flex", flexDirection: "column", gap: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
          <MiniField label="Nombre">
            <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} />
          </MiniField>

          <MiniField label="Color por defecto">
            <select className="admin-input" value={colorId} onChange={(e) => setColorId(e.target.value)}>
              <option value="">— Sin color —</option>
              {colors.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </MiniField>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
            <NumInput icon={<Move3d size={12} />} label="Pos X" value={px} onChange={setPx} step={0.05} />
            <NumInput icon={<Move3d size={12} />} label="Pos Y" value={py} onChange={setPy} step={0.05} />
            <NumInput icon={<Move3d size={12} />} label="Pos Z" value={pz} onChange={setPz} step={0.05} />
            <NumInput icon={<RotateCw size={12} />} label="Rot X" value={rx} onChange={setRx} step={0.1} />
            <NumInput icon={<RotateCw size={12} />} label="Rot Y" value={ry} onChange={setRy} step={0.1} />
            <NumInput icon={<RotateCw size={12} />} label="Rot Z" value={rz} onChange={setRz} step={0.1} />
          </div>
          <NumInput icon={<Maximize size={12} />} label="Escala" value={scale} onChange={setScale} step={0.05} min={0.01} />

          <button
            onClick={save}
            style={{
              padding: "0.55rem 1.1rem", background: "var(--accent-pink)", color: "white",
              border: "none", borderRadius: "var(--radius-pill)", fontWeight: 600,
              cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
              alignSelf: "flex-start", fontSize: "0.85rem",
            }}
          >
            <Check size={14} /> Guardar cambios
          </button>
        </div>
      )}
    </div>
  );
}

function MiniField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", letterSpacing: "0.5px", textTransform: "uppercase" }}>{label}</span>
      {children}
    </label>
  );
}

function NumInput({
  icon, label, value, onChange, step = 0.1, min,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
        {icon} {label}
      </span>
      <input
        type="number"
        className="admin-input"
        value={value}
        step={step}
        min={min}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          onChange(isNaN(v) ? 0 : v);
        }}
        style={{ fontSize: "0.82rem", padding: "0.4rem 0.6rem", fontFamily: "monospace" }}
      />
    </label>
  );
}

/* styles */
const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100,
  display: "flex", alignItems: "center", justifyContent: "center",
  backdropFilter: "blur(4px)", padding: "1.5rem",
};
const modalStyle: React.CSSProperties = {
  background: "var(--bg-panel)", borderRadius: "var(--radius-xl)",
  border: "1px solid rgba(255,255,255,0.06)",
  maxWidth: 640, width: "100%", maxHeight: "90vh", overflowY: "auto",
  padding: "1.75rem",
};
const iconBoxStyle: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 10, background: "rgba(255,42,133,0.12)",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const closeBtnStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: "var(--radius-sm)",
  background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
  color: "var(--text-secondary)", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const sectionStyle: React.CSSProperties = {
  padding: "1rem 1.25rem", borderRadius: "var(--radius-xl)",
  border: "1px solid rgba(255,255,255,0.06)", marginBottom: "1rem",
};
const sectionLabelStyle: React.CSSProperties = {
  fontSize: "0.72rem", fontWeight: 600, letterSpacing: "1.2px",
  textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "0.75rem",
};
const secondaryBtnStyle: React.CSSProperties = {
  padding: "0.6rem 1.2rem", background: "transparent",
  border: "1px solid rgba(255,255,255,0.12)", color: "var(--text-secondary)",
  borderRadius: "var(--radius-pill)", cursor: "pointer", fontSize: "0.88rem",
};

function iconBtn(color: string): React.CSSProperties {
  return {
    width: 30, height: 30, display: "inline-flex", alignItems: "center", justifyContent: "center",
    background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
    color, borderRadius: "var(--radius-sm)", cursor: "pointer",
  };
}
