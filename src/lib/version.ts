/**
 * HARDCODED APP VERSION
 */
export const CURRENT_APP_VERSION = '1.1.0';

/**
 * Robust SemVer comparison
 * Returns:
 *  1 if v1 > v2
 * -1 if v1 < v2
 *  0 if v1 == v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const a = parts1[i] || 0;
    const b = parts2[i] || 0;
    if (a > b) return 1;
    if (a < b) return -1;
  }
  return 0;
}
