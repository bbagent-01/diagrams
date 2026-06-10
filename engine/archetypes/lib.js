// ============================================================
// engine/archetypes/lib.js
// Shared helpers for the diagram archetypes.
// - iconSVG(name)         → inline Lucide-style line icon (24x24 viewBox)
// - heroSVG(glyph, accent)→ Okta sunburst if glyph empty/"okta",
//                            else a tasteful monogram tile glyph.
// - escapeHTML(s)         → HTML-escape user-supplied strings
// - deriveGradient(hex)   → tasteful {from,to} pair derived from one hex
// ============================================================

// ---------- Icon library (Lucide-style line icons) ----------
// stroke:currentColor; stroke-width:1.75; round caps/joins; fill:none.
const ICONS = {
  'file-cog': `
    <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
    <path d="M4 6V4a2 2 0 0 1 2-2h8l6 6v3"/>
    <path d="M4 22a2 2 0 0 1-2-2"/>
    <circle cx="6" cy="18" r="3"/>
    <path d="M6 14v1"/><path d="M6 21v1"/>
    <path d="m2.6 15.5 .87.5"/><path d="m8.53 19 .87.5"/>
    <path d="m2.6 20.5 .87-.5"/><path d="m8.53 17 .87-.5"/>`,
  'users': `
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  'contact': `
    <path d="M16 18a4 4 0 0 0-8 0"/>
    <rect width="18" height="18" x="3" y="4" rx="2"/>
    <circle cx="12" cy="10" r="2"/>
    <line x1="8" x2="8" y1="2" y2="4"/>
    <line x1="16" x2="16" y1="2" y2="4"/>`,
  'user-plus': `
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" x2="19" y1="8" y2="14"/>
    <line x1="22" x2="16" y1="11" y2="11"/>`,
  'user-round': `
    <circle cx="12" cy="8" r="5"/>
    <path d="M20 21a8 8 0 0 0-16 0"/>`,
  'user-check': `
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="m16 11 2 2 4-4"/>`,
  'database': `
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M3 5v14a9 3 0 0 0 18 0V5"/>
    <path d="M3 12a9 3 0 0 0 18 0"/>`,
  'shield': `
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>`
};

/**
 * Returns inline SVG markup for a named icon, sized to fit a parent
 * via CSS (the SVG itself uses viewBox 0 0 24 24). Stroke uses
 * currentColor so the parent can color it via `color:` style.
 *
 * Falls back to user-round if the name isn't known, so a bad value
 * never breaks layout.
 */
export function iconSVG(name) {
  const body = ICONS[name] || ICONS['user-round'];
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

// ---------- Hero artwork ----------
// The Okta sunburst — 16 tapered radial strokes around a hollow center.
// Black, viewBox 64. Identical proportions to the tokenized version
// in okta.css, but inline so a render page can swap it dynamically.
const OKTA_SUNBURST = `
  <g stroke="#1A1A1A" stroke-width="3" stroke-linecap="round">
    <line x1="32" y1="18" x2="32" y2="6"/>
    <line x1="37.36" y1="19.07" x2="41.95" y2="7.98"/>
    <line x1="41.9" y1="22.1" x2="50.38" y2="13.62"/>
    <line x1="44.93" y1="26.64" x2="56.02" y2="22.05"/>
    <line x1="46" y1="32" x2="58" y2="32"/>
    <line x1="44.93" y1="37.36" x2="56.02" y2="41.95"/>
    <line x1="41.9" y1="41.9" x2="50.38" y2="50.38"/>
    <line x1="37.36" y1="44.93" x2="41.95" y2="56.02"/>
    <line x1="32" y1="46" x2="32" y2="58"/>
    <line x1="26.64" y1="44.93" x2="22.05" y2="56.02"/>
    <line x1="22.1" y1="41.9" x2="13.62" y2="50.38"/>
    <line x1="19.07" y1="37.36" x2="7.98" y2="41.95"/>
    <line x1="18" y1="32" x2="6" y2="32"/>
    <line x1="19.07" y1="26.64" x2="7.98" y2="22.05"/>
    <line x1="22.1" y1="22.1" x2="13.62" y2="13.62"/>
    <line x1="26.64" y1="19.07" x2="22.05" y2="7.98"/>
  </g>`;

/**
 * Build the hero artwork inside a 64x64 viewBox.
 *
 * - If `glyph` is empty / "okta" / "Okta" → returns the sunburst.
 * - Otherwise: a tasteful monogram. Filled accent circle, white
 *   DM-Sans-semibold letters. 1–3 chars supported.
 */
export function heroSVG(glyph, accent) {
  const g = (glyph || '').trim();
  if (!g || g.toLowerCase() === 'okta') {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${OKTA_SUNBURST}</svg>`;
  }
  // Monogram: 1–3 chars max, uppercase for visual consistency.
  const txt = g.slice(0, 3).toUpperCase();
  // Letter sizing tightens slightly as the count grows so 3 chars fit.
  const fontSize = txt.length === 1 ? 30 : txt.length === 2 ? 24 : 18;
  const safeAccent = sanitizeHex(accent) || '#4B4FE8';
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="26" fill="${safeAccent}"/>
    <text x="32" y="32" fill="#FFFFFF" font-family="'DM Sans', system-ui, sans-serif" font-size="${fontSize}" font-weight="600" text-anchor="middle" dominant-baseline="central" letter-spacing="-0.02em">${escapeHTML(txt)}</text>
  </svg>`;
}

// ---------- HTML escape ----------
export function escapeHTML(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------- Color helpers ----------
function sanitizeHex(hex) {
  if (!hex) return null;
  const m = String(hex).trim().match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return '#' + h.toLowerCase();
}

function hexToRgb(hex) {
  const h = sanitizeHex(hex);
  if (!h) return null;
  return {
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16)
  };
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function hslToHex({ h, s, l }) {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)      { r = c; g = x; b = 0; }
  else if (h < 120){ r = x; g = c; b = 0; }
  else if (h < 180){ r = 0; g = c; b = x; }
  else if (h < 240){ r = 0; g = x; b = c; }
  else if (h < 300){ r = x; g = 0; b = c; }
  else             { r = c; g = 0; b = x; }
  const toHex = v => {
    const n = Math.round((v + m) * 255);
    return Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  };
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

/**
 * Derive a tasteful 135° gradient pair from a single accent hex.
 * - `from` = the accent itself (slightly deepened — drop lightness ~10%)
 * - `to`   = shift lightness up ~25% with a small hue nudge so the
 *            corner bloom feels alive rather than washed.
 *
 * Returns `{from, to}` as hex strings. If the input is unparseable,
 * falls back to the Okta indigo pair so the engine never breaks.
 */
export function deriveGradient(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return { from: '#3D45E5', to: '#8E92F0' };
  const hsl = rgbToHsl(rgb);
  const from = hslToHex({
    h: hsl.h,
    s: Math.max(35, Math.min(95, hsl.s)),
    l: Math.max(20, Math.min(50, hsl.l - 6))
  });
  const to = hslToHex({
    h: (hsl.h + 6) % 360,
    s: Math.max(25, Math.min(80, hsl.s - 8)),
    l: Math.max(55, Math.min(82, hsl.l + 25))
  });
  return { from, to };
}

/**
 * Utility: accept "Label::icon-name" or plain "Label" → {label, icon}.
 * Used by render.html when items are pipe-separated in the URL.
 */
export function parseLabeledItem(raw, defaultIcon = 'user-round') {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  const idx = s.indexOf('::');
  if (idx === -1) return { label: s, icon: defaultIcon };
  return {
    label: s.slice(0, idx).trim(),
    icon: (s.slice(idx + 2).trim() || defaultIcon)
  };
}
