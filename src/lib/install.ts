export type InstallPlatform = "installed" | "ios" | "other";

/**
 * Wie kann die Seite auf den Startbildschirm gelegt werden?
 * - "installed": läuft schon als App, nichts anzeigen
 * - "ios": iPhone/iPad, dort gibt es keinen Installieren-Knopf, nur die Anleitung über „Teilen“
 * - "other": Android/Computer, dort kommt der Installieren-Knopf vom Browser (beforeinstallprompt)
 */
export function detectPlatform(input: { userAgent: string; maxTouchPoints?: number; standalone?: boolean; displayModeStandalone?: boolean }): InstallPlatform {
  if (input.standalone || input.displayModeStandalone) return "installed";
  const ua = input.userAgent;
  const iPhoneOrPod = /iPhone|iPod/.test(ua);
  const iPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && (input.maxTouchPoints ?? 0) > 1); // neue iPads melden sich als Mac
  return iPhoneOrPod || iPad ? "ios" : "other";
}

export const INSTALL_DISMISSED_KEY = "hoerdle-install-dismissed";
