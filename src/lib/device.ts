/**
 * Detects if the current user agent / platform is an iOS device (iPhone, iPad, iPod, Mac Safari with Touch).
 */
export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export const isIOSDevice = isIOS;

/**
 * Checks if the user is using an iOS browser (Safari/Chrome on iOS) on the Web (not inside native Capacitor shell).
 */
export function isIOSWeb(): boolean {
  return isIOS();
}
