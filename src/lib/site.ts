/**
 * Öffentliche Adresse der Seite, z. B. "https://hoerdle.lovable.app" (ohne Schrägstrich am Ende).
 * Nach dem Veröffentlichen hier eintragen: WhatsApp, Discord & Co. zeigen das Vorschaubild nur
 * bei einer vollständigen Adresse zuverlässig an. Leer = relativer Pfad (funktioniert nur teilweise).
 */
export const SITE_URL = "";

export const OG_IMAGE_PATH = "/og-image.png";

export const absoluteUrl = (path: string) => `${SITE_URL.replace(/\/+$/, "")}${path}`;
