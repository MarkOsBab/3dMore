"use client";

// Suppress known third-party deprecation warnings from three.js r168+ / r3f internals
// that we cannot fix from our own code (THREE.Clock used by r3f, PCFSoftShadowMap resolved internally).
if (typeof window !== "undefined") {
  const _warn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (msg.includes("THREE.Clock") || msg.includes("PCFSoftShadowMap")) return;
    _warn(...args);
  };
}

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Center, Bounds, Environment, ContactShadows } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import * as THREE from "three";

/** Shared loader setup: enables Draco + Meshopt decompression for GLB files. */
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
function setupGLTFLoader(loader: GLTFLoader) {
  loader.setDRACOLoader(dracoLoader);
  loader.setMeshoptDecoder(MeshoptDecoder);
}
import { Loader2 } from "lucide-react";

/** Returns the relative luminance (0–1) of a hex color. */
function hexLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

const LIGHT_BG = {
  style:
    "radial-gradient(ellipse at top, rgba(255,225,190,0.55), transparent 60%), radial-gradient(ellipse at bottom, rgba(255,170,200,0.35), transparent 60%), #f4ecdf",
  canvas: "#f4ecdf",
};

const DARK_BG = {
  style:
    "radial-gradient(ellipse at top, rgba(60,60,100,0.45), transparent 60%), radial-gradient(ellipse at bottom, rgba(30,30,70,0.35), transparent 60%), #1a1a2e",
  canvas: "#1a1a2e",
};

/**
 * Picks a background that contrasts with the selected part colors.
 * If any part has a light color (luminance > 0.45), switch to the dark background.
 */
function getViewerBackground(partColors: Record<string, string>) {
  const colors = Object.values(partColors).filter((c) => /^#[0-9a-fA-F]{6}$/.test(c));
  if (colors.length === 0) return LIGHT_BG;
  const maxLum = Math.max(...colors.map(hexLuminance));
  return maxLum > 0.45 ? DARK_BG : LIGHT_BG;
}

export type ViewerPart = {
  id: string;
  name: string;
  modelUrl: string;
  format: string; // "stl" | "glb" | "gltf"
  positionX: number;
  positionY: number;
  positionZ: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
};

export type CameraView = {
  yaw: number;     // radians around Y (0 = front)
  pitch: number;   // radians, 0 = horizontal, positive = look from above
  zoom: number;    // camera distance from target
  targetX?: number;
  targetY?: number;
  targetZ?: number;
};

export type ViewerHandle = {
  getCurrentView: () => CameraView;
  /** Re-center the camera target to the geometric centre of the scene (preserves orientation). */
  recenter: () => void;
  /** Auto-fit: target the scene centre and set distance so it fills the frame. */
  fitToScene: (margin?: number) => void;
};

type Props = {
  parts: ViewerPart[];
  /** map partId -> hex color */
  partColors: Record<string, string>;
  /** optional: fixed pixel height, default responsive via aspect ratio */
  height?: number | string;
  autoRotate?: boolean;
  /** initial camera view; defaults to frontal */
  initialView?: CameraView;
  /** receives a handle to read current camera; admin only */
  onReady?: (handle: ViewerHandle) => void;
  /** show "drag to rotate" hint; default true */
  showHint?: boolean;
};

/** Renders an STL part. */
function StlPart({ part, color }: { part: ViewerPart; color: string }) {
  const geometry = useLoader(STLLoader, part.modelUrl) as THREE.BufferGeometry;

  // Center + normalize so the model fits inside a unit cube regardless of source units (mm/cm/m).
  const centered = useMemo(() => {
    const g = geometry.clone();
    g.center();
    g.computeBoundingBox();
    const box = g.boundingBox!;
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const normalize = 1 / maxDim;
    g.scale(normalize, normalize, normalize);
    g.computeVertexNormals();
    return g;
  }, [geometry]);

  return (
    <mesh
      geometry={centered}
      position={[part.positionX, part.positionY, part.positionZ]}
      rotation={[part.rotationX, part.rotationY, part.rotationZ]}
      scale={part.scale}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} metalness={0.15} roughness={0.55} />
    </mesh>
  );
}

/** Renders a GLB/GLTF part; recolors ALL meshes with the given color. */
function GlbPart({ part, color }: { part: ViewerPart; color: string }) {
  const gltf = useLoader(GLTFLoader, part.modelUrl, setupGLTFLoader);

  // Compute normalization params separately (stable as long as gltf doesn't change).
  const { normScale, normOffset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const s = 1 / maxDim;
    return {
      normScale: s,
      // The wrapper group is scaled by s, so to center we translate by -center (in pre-scale space).
      normOffset: [-center.x, -center.y, -center.z] as [number, number, number],
    };
  }, [gltf]);

  // Clone the scene and recolor meshes. Do NOT modify position/scale — those are
  // handled by the wrapper groups below so that <primitive> props don't override them.
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.material = new THREE.MeshStandardMaterial({
          color,
          metalness: 0.15,
          roughness: 0.55,
        });
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return cloned;
  }, [gltf, color]);

  // Outer group: applies the user-configurable part transform (position / rotation / scale).
  // Inner group: normalizes the GLB to a unit cube centered at origin.
  // We avoid setting position/scale directly on <primitive> because r3f would override
  // any transforms we applied to the object in useMemo.
  return (
    <group
      position={[part.positionX, part.positionY, part.positionZ]}
      rotation={[part.rotationX, part.rotationY, part.rotationZ]}
      scale={part.scale}
    >
      <group position={normOffset} scale={normScale}>
        <primitive object={scene} />
      </group>
    </group>
  );
}


function PartRenderer({ part, color }: { part: ViewerPart; color: string }) {
  if (part.format === "glb" || part.format === "gltf") {
    return <GlbPart part={part} color={color} />;
  }
  return <StlPart part={part} color={color} />;
}

function AutoRotateGroup({ children, enabled }: { children: React.ReactNode; enabled: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (enabled && ref.current) ref.current.rotation.y += delta * 0.25;
  });
  return <group ref={ref}>{children}</group>;
}

function viewToPosition(view: CameraView): [number, number, number] {
  const { yaw, pitch, zoom } = view;
  const x = zoom * Math.sin(yaw) * Math.cos(pitch);
  const y = zoom * Math.sin(pitch);
  const z = zoom * Math.cos(yaw) * Math.cos(pitch);
  return [x, y, z];
}

function positionToView(pos: THREE.Vector3): CameraView {
  const zoom = pos.length();
  const pitch = Math.asin(pos.y / (zoom || 1));
  const yaw = Math.atan2(pos.x, pos.z);
  return { yaw, pitch, zoom };
}

/** Installs initial camera and exposes a handle via onReady. Must live inside <Canvas>. */
function CameraBridge({
  initialView,
  controlsRef,
  onReady,
  contentRef,
}: {
  initialView: CameraView;
  controlsRef: React.MutableRefObject<any>;
  onReady?: (h: ViewerHandle) => void;
  contentRef: React.MutableRefObject<THREE.Group | null>;
}) {
  const { camera, size } = useThree();
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) return;
    const tx = initialView.targetX ?? 0;
    const ty = initialView.targetY ?? 0;
    const tz = initialView.targetZ ?? 0;
    const [rx, ry, rz] = viewToPosition(initialView);
    camera.position.set(tx + rx, ty + ry, tz + rz);
    const ctl = controlsRef.current;
    if (ctl) {
      ctl.target.set(tx, ty, tz);
      ctl.update();
    } else {
      camera.lookAt(tx, ty, tz);
    }
    camera.updateProjectionMatrix();
    applied.current = true;
  }, [initialView, camera, controlsRef]);

  useEffect(() => {
    if (!onReady) return;

    const computeSceneBox = (): THREE.Box3 | null => {
      const root = contentRef.current;
      if (!root) return null;
      const box = new THREE.Box3().setFromObject(root);
      return box.isEmpty() ? null : box;
    };

    onReady({
      getCurrentView: () => {
        const ctl = controlsRef.current;
        const target = ctl?.target ?? new THREE.Vector3(0, 0, 0);
        const rel = new THREE.Vector3().subVectors(camera.position, target);
        const v = positionToView(rel);
        return {
          ...v,
          targetX: target.x,
          targetY: target.y,
          targetZ: target.z,
        };
      },
      recenter: () => {
        const ctl = controlsRef.current;
        if (!ctl) return;
        const box = computeSceneBox();
        const centre = box ? box.getCenter(new THREE.Vector3()) : new THREE.Vector3(0, 0, 0);
        // Preserve camera orientation, shift both camera and target so target lands on centre
        const delta = new THREE.Vector3().subVectors(centre, ctl.target);
        ctl.target.copy(centre);
        camera.position.add(delta);
        ctl.update();
      },
      fitToScene: (margin = 1.3) => {
        const ctl = controlsRef.current;
        const box = computeSceneBox();
        if (!ctl || !box) return;
        const centre = box.getCenter(new THREE.Vector3());
        const sizeVec = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z) || 1;

        // Use the perspective camera fov (vertical) to compute distance; also account for aspect.
        const persp = camera as THREE.PerspectiveCamera;
        const vFov = (persp.fov * Math.PI) / 180;
        const aspect = size.width / Math.max(size.height, 1);
        const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
        const distV = (sizeVec.y / 2) / Math.tan(vFov / 2);
        const distH = (Math.max(sizeVec.x, sizeVec.z) / 2) / Math.tan(hFov / 2);
        const distance = Math.max(distV, distH, maxDim) * margin;

        // Keep current direction from target -> camera
        const dir = new THREE.Vector3().subVectors(camera.position, ctl.target);
        if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
        dir.normalize().multiplyScalar(distance);

        ctl.target.copy(centre);
        camera.position.copy(centre).add(dir);
        ctl.update();
      },
    });
  }, [onReady, controlsRef, camera, size, contentRef]);

  return null;
}

export default function ProductModelViewer({
  parts,
  partColors,
  height = 500,
  autoRotate = false,
  initialView,
  onReady,
  showHint = true,
}: Props) {
  if (parts.length === 0) return null;

  const view: CameraView = initialView ?? { yaw: 0, pitch: 0, zoom: 3 };
  const controlsRef = useRef<any>(null);
  const contentRef = useRef<THREE.Group | null>(null);
  const [cx, cy, cz] = viewToPosition(view);

  const bg = getViewerBackground(partColors);

  return (
    <div
      style={{
        width: "100%",
        height,
        position: "relative",
        borderRadius: "24px",
        overflow: "hidden",
        background: bg.style,
        border: "1px solid rgba(0,0,0,0.06)",
        transition: "background 0.4s ease",
      }}
    >
      <Canvas
        shadows
        camera={{ position: [cx, cy, cz], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: false }}
      >
        <color attach="background" args={[bg.canvas]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-5, 3, -3]} intensity={0.3} color="#ffd9b0" />

        <Suspense fallback={null}>
          {/* When initialView is provided by admin, skip Bounds auto-fit to honour saved distance */}
          {initialView ? (
            <group ref={contentRef}>
              <Center>
                <AutoRotateGroup enabled={autoRotate}>
                  {parts.map((p) => (
                    <PartRenderer key={p.id} part={p} color={partColors[p.id] ?? "#cccccc"} />
                  ))}
                </AutoRotateGroup>
              </Center>
            </group>
          ) : (
            <Bounds fit clip observe margin={1.5}>
              <group ref={contentRef}>
                <Center>
                  <AutoRotateGroup enabled={autoRotate}>
                    {parts.map((p) => (
                      <PartRenderer key={p.id} part={p} color={partColors[p.id] ?? "#cccccc"} />
                    ))}
                  </AutoRotateGroup>
                </Center>
              </group>
            </Bounds>
          )}
          <ContactShadows position={[0, -0.6, 0]} opacity={0.4} scale={4} blur={2.5} far={2} />
          <Environment preset="studio" />
        </Suspense>

        <CameraBridge initialView={view} controlsRef={controlsRef} onReady={onReady} contentRef={contentRef} />

        <OrbitControls
          ref={controlsRef}
          enablePan
          enableZoom
          minDistance={1.2}
          maxDistance={10}
          autoRotate={false}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.PAN,
            RIGHT: THREE.MOUSE.PAN,
          }}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
        />
      </Canvas>

      <noscript>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#aaa" }}>
          Tu navegador no soporta 3D.
        </div>
      </noscript>

      {showHint && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 12,
            fontSize: "0.7rem",
            color: bg.canvas === "#1a1a2e" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)",
            pointerEvents: "none",
            letterSpacing: "0.5px",
          }}
        >
          Arrastrá para rotar · rueda para zoom · clic rueda/derecho para mover
        </div>
      )}
    </div>
  );
}

/** Fallback shown while the viewer's chunk is loading. */
export function ViewerSkeleton({ height = 500 }: { height?: number | string }) {
  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: "24px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        display: "grid",
        placeItems: "center",
        color: "var(--text-secondary)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <Loader2 size={24} className="spin" />
        <span style={{ fontSize: "0.85rem" }}>Cargando visor 3D…</span>
      </div>
    </div>
  );
}
