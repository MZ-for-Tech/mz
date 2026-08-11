/**
 * Capability-signal types used by performance gating (F2 warm-up gate,
 * DarkVeil low-power heuristic).
 *
 * `connection` (Network Information API) and `deviceMemory` are not part of
 * TypeScript's DOM lib; both are optional at runtime (Firefox/Safari omit
 * them), so every consumer must null-check before reading.
 */
interface NetworkInformation {
  saveData?: boolean;
}

interface Navigator {
  connection?: NetworkInformation;
  deviceMemory?: number;
}
