import { useEffect, useState } from "react";
import { INSTALL_DISMISSED_KEY, detectPlatform, type InstallPlatform } from "@/lib/install";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

/** „Als App hinzufügen“: Android/Computer mit echtem Installieren-Knopf, iPhone/iPad mit Anleitung. */
export function InstallHint() {
  const [platform, setPlatform] = useState<InstallPlatform>("installed"); // bis zum Laden nichts zeigen
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform({
      userAgent: navigator.userAgent,
      maxTouchPoints: navigator.maxTouchPoints,
      standalone: (navigator as Navigator & { standalone?: boolean }).standalone,
      displayModeStandalone: window.matchMedia?.("(display-mode: standalone)").matches,
    }));
    try { setDismissed(localStorage.getItem(INSTALL_DISMISSED_KEY) === "1"); } catch { setDismissed(false); }

    const onPrompt = (e: Event) => { e.preventDefault(); setPrompt(e as InstallPromptEvent); };
    const onInstalled = () => { setPrompt(null); setPlatform("installed"); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  const hide = () => {
    setDismissed(true);
    try { localStorage.setItem(INSTALL_DISMISSED_KEY, "1"); } catch { /* egal */ }
  };

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setPrompt(null);
    if (outcome === "accepted") hide();
  };

  if (dismissed || platform === "installed") return null;
  if (platform === "other" && !prompt) return null; // Browser bietet keine Installation an

  return (
    <div className="mt-3 rounded-xl border border-border bg-card p-3 text-center" data-testid="install-hint">
      {platform === "ios" ? (
        <>
          <button onClick={() => setShowSteps((v) => !v)} aria-expanded={showSteps} className="text-sm font-extrabold">📲 Als App hinzufügen</button>
          {showSteps && (
            <ol className="mx-auto mt-2 max-w-xs list-decimal space-y-1 pl-5 text-left text-xs text-muted-foreground">
              <li>Tippe unten auf das <strong>Teilen</strong>-Symbol (Quadrat mit Pfeil nach oben).</li>
              <li>Scrolle und wähle <strong>„Zum Home-Bildschirm“</strong>.</li>
              <li>Tippe oben rechts auf <strong>„Hinzufügen“</strong>.</li>
            </ol>
          )}
        </>
      ) : (
        <button onClick={install} className="text-sm font-extrabold">📲 Als App hinzufügen</button>
      )}
      <p className="mt-1 text-xs text-muted-foreground">Öffnet sich dann im Vollbild wie eine App.</p>
      <button onClick={hide} className="mt-1 text-[11px] text-muted-foreground underline underline-offset-4 hover:text-foreground">Nicht mehr anzeigen</button>
    </div>
  );
}
