import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { detectPlatform } from "@/lib/install";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36";
const MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

describe("Als App hinzufügen", () => {
  it("erkennt iPhone und iPad (auch neue iPads, die sich als Mac melden)", () => {
    expect(detectPlatform({ userAgent: IPHONE })).toBe("ios");
    expect(detectPlatform({ userAgent: MAC, maxTouchPoints: 5 })).toBe("ios");
    expect(detectPlatform({ userAgent: MAC, maxTouchPoints: 0 })).toBe("other");
    expect(detectPlatform({ userAgent: ANDROID })).toBe("other");
  });

  it("zeigt nichts, wenn die Seite schon als App läuft", () => {
    expect(detectPlatform({ userAgent: IPHONE, standalone: true })).toBe("installed");
    expect(detectPlatform({ userAgent: ANDROID, displayModeStandalone: true })).toBe("installed");
  });
});

describe("Web-App-Manifest", () => {
  const manifest = JSON.parse(readFileSync("public/manifest.webmanifest", "utf8"));

  it("hat Name, Vollbild-Anzeige und Startadresse", () => {
    expect(manifest.short_name).toBe("Hördle");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.lang).toBe("de");
  });

  it("verweist nur auf vorhandene Icons, inklusive 192, 512 und maskierbar", () => {
    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    expect(manifest.icons.some((i: { purpose: string }) => i.purpose === "maskable")).toBe(true);
    for (const icon of manifest.icons) expect(existsSync(`public${icon.src}`)).toBe(true);
    expect(existsSync("public/apple-touch-icon.png")).toBe(true);
  });
});
