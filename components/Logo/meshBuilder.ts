/*
 * Logo mesh data: build, cache, hydrate.
 *
 * Building the logo costs an SVG fetch + SVGLoader parse + ~163 ExtrudeGeometry
 * constructions (MZ.svg — the previous logo had 480)
 * constructions (~300 ms of main-thread work) on every cold load. The built
 * items are cached three ways:
 *
 *   1. `globalMeshData` — in-memory, survives client-side navigation (not a
 *      hard reload). Reset to null on HMR so dev picks up material changes.
 *   2. IndexedDB — survives hard reloads. Geometry attributes are stored as
 *      typed arrays (structured clone, no JSON overhead) and rehydrated in a
 *      few ms, skipping the SVG parse + extrude entirely.
 *   3. Build-from-SVG — the original path, used when neither cache exists.
 *
 * The geometry/materials logic below is byte-for-byte what MzLogo3D used to
 * do inline; do not "improve" it — the Z_STEP layering, polygonOffset tuning
 * and material caching are the result of the flicker/gold-slab fixes.
 */

import {
  BufferAttribute,
  BufferGeometry,
  ExtrudeGeometry,
  MeshStandardMaterial,
} from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/*
 * Z-offset per painter's layer (in SVG coordinate units).
 * The SVG is drawn back-to-front (MZ.svg: 165 paths / 163 shapes).
 * Positions with multiple stacked paths share a depth plane without a Z offset
 * those paths share the exact same depth plane → z-fighting / flickering.
 *
 * ~163 * 0.02 = ~3.3 SVG units total stack height (was 9.6 for 480).
 * At scale 0.0035 → 0.034 world units (invisible at camera z=12).
 * The extrude depth is 32 SVG units, so the stack is < 30% of depth,
 * meaning the faces never bleed through the back of the logo.
 */
const Z_STEP = 0.02;

const extrudeSettings = {
  depth: 32,
  bevelEnabled: true,
  bevelThickness: 2,
  bevelSize: 1.5,
  bevelSegments: 1, // Reduced from 2 for better performance on mobile GPUs
  curveSegments: 1,
};

export interface MeshItem {
  geometry: BufferGeometry;
  material: MeshStandardMaterial[];
  pathIdx: number;
  zOffset: number;
  scatterX: number;
  scatterY: number;
  scatterZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
}

export interface MeshData {
  items: MeshItem[];
  cx: number;
  cy: number;
}

// Global cache to prevent re-building all geometries every time the user returns to the main page.
// Reset to null here so HMR picks up material changes during development.
export let globalMeshData: MeshData | null = null;

/** Store the built/hydrated mesh data for the rest of this session. */
export function rememberMeshData(data: MeshData): void {
  globalMeshData = data;
}

/*
 * Material caches: identical hex colors reuse the same material object,
 * so we never create more materials than there are unique colors.
 * Walls additionally key on path index (see polygonOffset below).
 */
const capMaterialCache = new Map<string, MeshStandardMaterial>();
const wallMaterialCache = new Map<string, MeshStandardMaterial>();

function getCapMaterial(color: string) {
  if (!capMaterialCache.has(color)) {
    capMaterialCache.set(
      color,
      new MeshStandardMaterial({
        color,
        metalness: 0.9,
        roughness: 0.25,
        // Caps don't need polygonOffset because Z_STEP physically separates them
        // and the tightened near/far planes give us plenty of depth precision.
      })
    );
  }
  return capMaterialCache.get(color)!;
}

function getWallMaterial(color: string, pathIdx: number) {
  const key = `${color}|${pathIdx}`;
  if (!wallMaterialCache.has(key)) {
    wallMaterialCache.set(
      key,
      new MeshStandardMaterial({
        color,
        metalness: 0.9,
        roughness: 0.25,
        // Walls need polygonOffset because they run parallel to Z and intersect physically.
        // POSITIVE factor pushes the wall AWAY from the camera so it doesn't bleed through the front cap.
        // Larger pathIdx = closer to camera = smaller offset, so closer walls win against further walls.
        polygonOffset: true,
        polygonOffsetFactor: (500 - pathIdx) * 0.1,
        polygonOffsetUnits: 1,
      })
    );
  }
  return wallMaterialCache.get(key)!;
}

/**
 * The original builder: parse the SVG and construct every geometry.
 * Only reached when no cache exists (first visit ever).
 */
export function buildMeshData(svgText: string): MeshData {
  const svg = new SVGLoader().parse(svgText);

  let pathIndex = 0;
  const items: MeshItem[] = [];

  // Parse viewBox to find exact mathematical center
  let cx = 0;
  let cy = 0;
  if (svg.xml) {
    const vb = (svg.xml as unknown as Element).getAttribute("viewBox");
    if (vb) {
      const parts = vb.split(/\s+/).map(parseFloat);
      if (parts.length === 4) {
        cx = parts[0] + parts[2] / 2;
        cy = parts[1] + parts[3] / 2;
      }
    }
  }

  svg.paths.forEach((path) => {
    const color = `#${path.color.getHexString()}`;
    const zOffset = pathIndex * Z_STEP;
    const thisPathIndex = pathIndex;
    pathIndex++;

    path.toShapes().forEach((shape) => {
      items.push({
        geometry: new ExtrudeGeometry(shape, extrudeSettings),
        material: [getCapMaterial(color), getWallMaterial(color, thisPathIndex)],
        pathIdx: thisPathIndex,
        zOffset,
        scatterX: (Math.random() - 0.5) * 3000,
        scatterY: (Math.random() - 0.5) * 3000,
        scatterZ: 500 + Math.random() * 2000,
        rotX: (Math.random() - 0.5) * Math.PI * 2,
        rotY: (Math.random() - 0.5) * Math.PI * 2,
        rotZ: (Math.random() - 0.5) * Math.PI * 2,
      });
    });
  });

  return { items, cx, cy };
}

/* ------------------------------------------------------------------ *
 * Serialization (IndexedDB cache)
 * ------------------------------------------------------------------ */

interface SerializedItem {
  position: Float32Array;
  normal: Float32Array;
  uv: Float32Array;
  color: string;
  pathIdx: number;
  zOffset: number;
  scatterX: number;
  scatterY: number;
  scatterZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  /**
   * ExtrudeGeometry splits its triangles into groups (caps → material index 0,
   * walls/bevel → 1) that map onto the mesh's 2-material array. Without them,
   * three's renderer iterates zero groups for an array material and draws
   * NOTHING — the logo renders but is completely invisible. This is the fix
   * for the "hidden on subsequent loads" cache bug.
   */
  groups: { start: number; count: number; materialIndex: number }[];
}

export interface CachedMeshData {
  cx: number;
  cy: number;
  /** Self-describing item count — validation checks items.length against it,
   * so a logo change never needs a hardcoded count updated in two places. */
  itemCount: number;
  items: SerializedItem[];
}

// Bump when mz.svg, the extrude settings, or the serialized shape change —
// stale caches must not survive a geometry-affecting edit.
const CACHE_KEY = "mz-logo-mesh-v3";
const DB_NAME = "mz-logo-cache";
const STORE = "mesh";

export function serializeMeshData(data: MeshData): CachedMeshData {
  return {
    cx: data.cx,
    cy: data.cy,
    itemCount: data.items.length,
    items: data.items.map((item) => {
      const g = item.geometry;
      return {
        position: g.getAttribute("position")!.array as Float32Array,
        normal: g.getAttribute("normal")!.array as Float32Array,
        uv: g.getAttribute("uv")!.array as Float32Array,
        color: (item.material[0] as MeshStandardMaterial).color.getStyle(),
        pathIdx: item.pathIdx,
        zOffset: item.zOffset,
        scatterX: item.scatterX,
        scatterY: item.scatterY,
        scatterZ: item.scatterZ,
        rotX: item.rotX,
        rotY: item.rotY,
        rotZ: item.rotZ,
        groups: g.groups.map((gr) => ({
          start: gr.start,
          count: gr.count,
          materialIndex: gr.materialIndex ?? 0,
        })),
      };
    }),
  };
}

export function hydrateMeshData(cached: CachedMeshData): MeshData {
  return {
    cx: cached.cx,
    cy: cached.cy,
    items: cached.items.map((item) => {
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new BufferAttribute(item.position, 3));
      geometry.setAttribute("normal", new BufferAttribute(item.normal, 3));
      geometry.setAttribute("uv", new BufferAttribute(item.uv, 2));
      // Restore the cap/wall groups — see SerializedItem.groups.
      for (const gr of item.groups) {
        geometry.addGroup(gr.start, gr.count, gr.materialIndex);
      }
      return {
        geometry,
        material: [getCapMaterial(item.color), getWallMaterial(item.color, item.pathIdx)],
        pathIdx: item.pathIdx,
        zOffset: item.zOffset,
        scatterX: item.scatterX,
        scatterY: item.scatterY,
        scatterZ: item.scatterZ,
        rotX: item.rotX,
        rotY: item.rotY,
        rotZ: item.rotZ,
      };
    }),
  };
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function readCachedMeshData(): Promise<CachedMeshData | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const get = tx.objectStore(STORE).get(CACHE_KEY);
      get.onsuccess = () => resolve((get.result as CachedMeshData) ?? null);
      get.onerror = () => reject(get.error);
    });
  } catch {
    return null; // private mode / blocked storage → build from SVG instead
  }
}

/**
 * Shape-validates a cached blob BEFORE hydrating. A cache that passes this
 * check hydrates without throwing; anything else is treated as a miss so a
 * stale/corrupt cache can never silently brick the logo.
 */
export function isValidCachedMeshData(cached: unknown): cached is CachedMeshData {
  if (!cached || typeof cached !== "object") return false;
  const blob = cached as Partial<CachedMeshData>;
  if (
    !Array.isArray(blob.items) ||
    typeof blob.itemCount !== "number" ||
    blob.items.length !== blob.itemCount
  ) {
    return false;
  }
  return blob.items.every((it) => {
    if (!it || typeof it !== "object") return false;
    const item = it as Partial<CachedMeshData["items"][number]>;
    return (
      item.position instanceof Float32Array &&
      item.normal instanceof Float32Array &&
      item.uv instanceof Float32Array &&
      item.position.length % 3 === 0 &&
      item.position.length > 0 &&
      item.normal.length === item.position.length &&
      item.uv.length === (item.position.length / 3) * 2 &&
      typeof item.color === "string" &&
      typeof item.pathIdx === "number" &&
      typeof item.zOffset === "number" &&
      Array.isArray(item.groups) &&
      item.groups.length > 0 &&
      item.groups.every(
        (gr) =>
          gr &&
          typeof gr.start === "number" &&
          typeof gr.count === "number" &&
          typeof gr.materialIndex === "number"
      )
    );
  });
}

export async function writeCachedMeshData(cached: CachedMeshData): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(cached, CACHE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // non-fatal: next load will rebuild
  }
}
