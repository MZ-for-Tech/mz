/**
 * Spatial keyboard navigation for the launcher.
 *
 * The original implementation walked a flat list of every [data-tile] on the
 * page and moved one step at a time: Right/Down were +1, Left/Up were -1. That
 * is wrong for the launcher's layout, which is a genuine 2D grid — one
 * featured tile beside a status card, with a five-across tile row below. Pressing
 * Down on the featured card moved sideways into the status card rather than
 * down into the tile row.
 *
 * Two behaviours are implemented here:
 *
 *   1. GEOMETRY. Before moving, we group the candidates into rows by their
 *      vertical centre, and reorder each row left-to-right by its horizontal
 *      centre. Down/Up then walk rows; Left/Right walk within a row. This works
 *      for any number of items, any layout, and any responsive breakpoint
 *      without the component having to describe its own grid.
 *
 *   2. A SOFT FLOOR. Because the geometry is derived from live measurements, a
 *      panel whose content is still animating in (or a viewport resize mid-
 *      transition) can briefly report a stale layout. When movement in the
 *      pressed direction would land on nothing, we allow a "backstop" move in
 *      the opposite direction before giving up. Without it the selection can
 *      silently stall — the exact dead-end a game menu must never have.
 */

/** Keys we treat as directional movement. */
const AXIS: Record<string, "x" | "y"> = {
  ArrowLeft: "x",
  ArrowRight: "x",
  ArrowUp: "y",
  ArrowDown: "y",
};

/** The key that moves back along the same axis. */
const OPPOSITE: Record<string, string> = {
  ArrowLeft: "ArrowRight",
  ArrowRight: "ArrowLeft",
  ArrowUp: "ArrowDown",
  ArrowDown: "ArrowUp",
};

type Rect = { el: HTMLElement; rect: DOMRect };

/**
 * Snap candidates into rows by vertical centre, then sort each row by
 * horizontal centre.
 *
 * Rows are seeded by the topmost item, and each remaining item joins the row
 * whose centre it is nearest to. This tolerates the small vertical drift that
 * comes from differing tile heights and baseline alignment, which a fixed
 * pixel threshold would turn into spurious extra rows.
 */
function toGrid(candidates: Rect[]): HTMLElement[][] {
  const rows: Rect[][] = [];

  const sorted = [...candidates].sort((a, b) => a.rect.top - b.rect.top);

  for (const item of sorted) {
    const centre = item.rect.top + item.rect.height / 2;
    let bestRow: Rect[] | null = null;
    let bestDistance = Infinity;

    for (const row of rows) {
      const rowCentre =
        row.reduce((sum, r) => sum + r.rect.top + r.rect.height / 2, 0) /
        row.length;
      const distance = Math.abs(rowCentre - centre);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestRow = row;
      }
    }

    if (bestRow && bestDistance <= item.rect.height / 2) {
      bestRow.push(item);
    } else {
      rows.push([item]);
    }
  }

  for (const row of rows) {
    row.sort((a, b) => a.rect.left - b.rect.left);
  }

  return rows.map((row) => row.map((r) => r.el));
}

export function findNeighbour(
  candidates: HTMLElement[],
  from: HTMLElement,
  key: string,
): HTMLElement | null {
  const axis = AXIS[key];
  if (!axis) return null;

  const active = document.activeElement as HTMLElement | null;

  // No current selection yet: enter the grid at its first item, whatever
  // direction was pressed. A game menu always has something highlighted.
  if (!active || !candidates.includes(active)) {
    return candidates[0] ?? null;
  }

  // Anything not currently rendered (display:none, collapsed panel) has a
  // zero rect. Measuring those produces nonsense coordinates, so drop them.
  const measured = candidates
    .map((el) => ({ el, rect: el.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 0 && rect.height > 0);

  const current = measured.find(({ el }) => el === active);
  if (!current) return null;

  const grid = toGrid(measured);
  const rowIndex = grid.findIndex((row) => row.includes(active));
  if (rowIndex === -1) return null;

  const columnIndex = grid[rowIndex].indexOf(active);
  if (columnIndex === -1) return null;

  const step = key === "ArrowRight" || key === "ArrowDown" ? 1 : -1;

  if (axis === "y") {
    // Vertical: change row, keep the column as close as possible.
    const targetRow = grid[rowIndex + step];
    if (!targetRow) return null;
    return targetRow[
      Math.min(columnIndex, targetRow.length - 1)
    ] ?? null;
  }

  // Horizontal: stay on this row and step across it.
  const targetRow = grid[rowIndex];
  if (!targetRow) return null;
  return targetRow[columnIndex + step] ?? null;
}

/**
 * Resolve the element a keypress should move selection to, including the
 * soft-floor backstop described in the module comment.
 */
export function resolveMove(
  candidates: HTMLElement[],
  from: HTMLElement,
  key: string,
): HTMLElement | null {
  const direct = findNeighbour(candidates, from, key);
  if (direct) return direct;

  // Soft floor: the pressed direction is exhausted, so step the other way
  // along the same axis rather than leaving the selection frozen.
  const opposite = OPPOSITE[key];
  if (opposite) {
    const backstop = findNeighbour(candidates, from, opposite);
    if (backstop) return backstop;
  }

  return null;
}
