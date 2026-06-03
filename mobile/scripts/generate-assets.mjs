/**
 * Generates all NoteAll icon & splash assets from inline SVG using `sharp`.
 *
 * Brand mark: a clean notebook page with text lines and an indigo pen — a
 * minimal nod to the in-app lucide "NotebookPen" logo. Slate (#0f172a) brand
 * background so the icon reads well on both light and dark home screens.
 *
 * Run:  node scripts/generate-assets.mjs
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");

const SLATE = "#0f172a";
const WHITE = "#ffffff";
const INDIGO = "#6366f1";
const INDIGO_DARK = "#4f46e5";
const LINE = "#cbd5e1";

/**
 * The brand glyph (notebook page + pen), centered at (cx, cy) and scaled by `s`.
 * Drawn in a coordinate space where the mark spans roughly 460x520 at s=1.
 */
function glyph(cx, cy, s) {
  return `
    <g transform="translate(${cx} ${cy}) scale(${s})">
      <!-- page -->
      <rect x="-180" y="-240" width="360" height="480" rx="46"
            fill="${WHITE}"/>
      <!-- title line (accent) -->
      <rect x="-120" y="-156" width="168" height="30" rx="15" fill="${INDIGO}"/>
      <!-- body lines -->
      <rect x="-120" y="-86" width="240" height="24" rx="12" fill="${LINE}"/>
      <rect x="-120" y="-30" width="240" height="24" rx="12" fill="${LINE}"/>
      <rect x="-120" y="26"  width="160" height="24" rx="12" fill="${LINE}"/>
      <!-- pen: nib points down-left onto the page, barrel runs to upper-right -->
      <g transform="translate(96 150) rotate(-45)">
        <rect x="-70" y="-30" width="250" height="60" rx="30" fill="${INDIGO}"/>
        <rect x="118" y="-30" width="26" height="60" fill="${INDIGO_DARK}"/>
        <polygon points="-70,-30 -132,0 -70,30" fill="${INDIGO}"/>
        <polygon points="-104,-15 -132,0 -104,15" fill="${WHITE}"/>
      </g>
    </g>`;
}

/** Full square icon: brand background + glyph (no transparency for iOS). */
function iconSvg(size = 1024) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
    <rect width="1024" height="1024" fill="${SLATE}"/>
    ${glyph(512, 500, 1.18)}
  </svg>`;
}

/** Android adaptive foreground: transparent bg, glyph kept inside the safe zone. */
function adaptiveForegroundSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    ${glyph(512, 512, 1.02)}
  </svg>`;
}

/** Splash: glyph + NoteAll wordmark, transparent (slate provided by config). */
function splashSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    ${glyph(512, 430, 0.92)}
    <text x="512" y="820" text-anchor="middle"
          font-family="Helvetica, Arial, sans-serif" font-size="120" font-weight="700"
          fill="${WHITE}" letter-spacing="2">NoteAll</text>
  </svg>`;
}

async function render(svg, file, size) {
  const out = join(ASSETS, file);
  await sharp(Buffer.from(svg))
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out);
  console.log("wrote", file, `(${size}x${size})`);
}

await render(iconSvg(), "icon.png", 1024);
await render(adaptiveForegroundSvg(), "adaptive-icon.png", 1024);
await render(splashSvg(), "splash-icon.png", 1024);
await render(iconSvg(), "favicon.png", 48);
console.log("done");
