// ============================================================
// engine/archetypes/partners-hub.js
// Renders the "Partners → Hub" archetype (blue or cream).
//
// API:
//   renderPartnersHub({
//     title,        // optional small headline (top-left). Empty = no headline.
//     hubName,      // optional caption under hero (unused; reserved)
//     hubGlyph,     // glyph for hero (empty/"okta" → Okta sunburst)
//     edgeLabel,    // "IdP" by default
//     items,        // [string] partner names (up to 6)
//     style,        // "blue" | "cream"
//     accent        // hex, used for hero monogram and person-glyph ring
//   }) → HTML string
//
// Matches diagrams/partners-idp.html for style="blue". For cream,
// adapts the same converging-IdP pattern to a cream panel with
// dark warm-gray connectors and soft-gray partner tiles.
// ============================================================

import { iconSVG, heroSVG, escapeHTML } from './lib.js';

export function renderPartnersHub({
  title = '',
  hubName = '',
  hubGlyph = '',
  edgeLabel = 'IdP',
  items = [],
  style = 'blue',
  accent = '#4B4FE8'
} = {}) {
  const partners = (items || [])
    .map(n => String(n || '').trim())
    .filter(Boolean)
    .slice(0, 6);

  return style === 'cream'
    ? renderCream({ title, hubGlyph, edgeLabel, items: partners, accent })
    : renderBlue({ title, hubGlyph, edgeLabel, items: partners, accent });
}

// ---------- BLUE variant (matches diagrams/partners-idp.html) ----------
function renderBlue({ title, hubGlyph, edgeLabel, items, accent }) {
  // Compute vertical layout of partner tiles. Tiles are 120x120 with
  // an 18px gap target equivalent. Coordinate space is 900x900.
  // Hero tile left: 684, top: 390 (center 744, 450).
  const tileSize = 120;
  const heroCenterY = 450;
  const heroX = 684;
  const tileX = 96;
  const tileRightX = tileX + tileSize; // 216

  // Distribute N tiles symmetrically about y=heroCenterY.
  // Use vertical step 176 (matches reference for 3 tiles).
  const stepY = items.length <= 3 ? 176 : 130;
  const totalH = (items.length - 1) * stepY;
  const startY = heroCenterY - totalH / 2 - tileSize / 2;

  const tiles = items.map((name, i) => {
    const y = startY + i * stepY;
    return `
      <div class="tile tile--soft tile--labeled p${i + 1}" style="left:${tileX}px; top:${Math.round(y)}px;">
        <span class="person-glyph">
          <span class="ring"></span>
          ${iconSVG('user-round')}
        </span>
        <span class="tile__caption">${escapeHTML(name)}</span>
      </div>`;
  }).join('');

  // Connectors: route each tile's right-center to the hero edge nearest
  // its row (top / left / bottom), following the same orthogonal style.
  const connectors = items.map((_, i) => {
    const tileCenterY = Math.round(startY + i * stepY + tileSize / 2);
    let path, arrow, labelY, labelX;
    const aligned = Math.abs(tileCenterY - heroCenterY) < 18;
    if (aligned) {
      // Straight horizontal into hero left edge (684, heroCenterY)
      path = `M ${tileRightX} ${tileCenterY} H 678`;
      arrow = `<polygon class="arrow-fill" points="684,${tileCenterY} 676,${tileCenterY - 4} 676,${tileCenterY + 4}" />`;
      labelY = tileCenterY;
      labelX = Math.round((tileRightX + 678) / 2);
    } else if (tileCenterY < heroCenterY) {
      // Right then DOWN into hero top
      path = `M ${tileRightX} ${tileCenterY} H 744 V 386`;
      arrow = `<polygon class="arrow-fill" points="744,392 740,384 748,384" />`;
      labelY = tileCenterY;
      labelX = Math.round((tileRightX + 744) / 2);
    } else {
      // Right then UP into hero bottom
      path = `M ${tileRightX} ${tileCenterY} H 744 V 514`;
      arrow = `<polygon class="arrow-fill" points="744,508 740,516 748,516" />`;
      labelY = tileCenterY;
      labelX = Math.round((tileRightX + 744) / 2);
    }
    return { path, arrow, labelY, labelX };
  });

  const connectorSVG = connectors.map(c => `<path d="${c.path}" />${c.arrow}`).join('');
  const edgeLabels = edgeLabel
    ? connectors.map(c => `<span class="edge-label" style="left:${c.labelX}px; top:${c.labelY}px;">${escapeHTML(edgeLabel)}</span>`).join('')
    : '';

  return `
    <style>
      .panel--PB {
        width: 900px;
        height: 900px;
      }
      .panel--PB .tile { position: absolute; }
      .panel--PB .hero {
        left: ${heroX}px;
        top: 390px;
      }
      .panel--PB .tile--hero svg { width: 56px; height: 56px; }
      .panel--PB .person-glyph .ring { border-color: ${accent}; }
      .panel--PB .headline-row {
        position: absolute;
        left: 64px; top: 64px;
      }
      .panel--PB .panel__headline { color: #FFFFFF; }
    </style>
    <section class="panel panel--blue panel--PB">
      <svg class="connector-layer" viewBox="0 0 900 900" preserveAspectRatio="none">
        ${connectorSVG}
      </svg>
      ${edgeLabels}
      ${title ? `<div class="headline-row"><h1 class="panel__headline">${escapeHTML(title)}</h1></div>` : ''}
      ${tiles}
      <div class="tile tile--hero hero">${heroSVG(hubGlyph, accent)}</div>
    </section>`;
}

// ---------- CREAM variant ----------
// Same converging pattern, cream panel, warm-gray connectors,
// dark ink labels, soft-gray partner tiles.
function renderCream({ title, hubGlyph, edgeLabel, items, accent }) {
  const tileSize = 120;
  const heroCenterY = 450;
  const heroX = 684;
  const tileX = 96;
  const tileRightX = tileX + tileSize;
  const stepY = items.length <= 3 ? 176 : 130;
  const totalH = (items.length - 1) * stepY;
  const startY = heroCenterY - totalH / 2 - tileSize / 2;

  const tiles = items.map((name, i) => {
    const y = startY + i * stepY;
    return `
      <div class="tile tile--cream-soft tile--labeled" style="left:${tileX}px; top:${Math.round(y)}px;">
        <span class="person-glyph">
          <span class="ring"></span>
          ${iconSVG('user-round')}
        </span>
        <span class="tile__caption">${escapeHTML(name)}</span>
      </div>`;
  }).join('');

  const connectors = items.map((_, i) => {
    const tileCenterY = Math.round(startY + i * stepY + tileSize / 2);
    let path, arrow, labelY, labelX;
    const aligned = Math.abs(tileCenterY - heroCenterY) < 18;
    if (aligned) {
      path = `M ${tileRightX} ${tileCenterY} H 678`;
      arrow = `<polygon class="arrow-fill" points="684,${tileCenterY} 676,${tileCenterY - 4} 676,${tileCenterY + 4}" />`;
      labelY = tileCenterY;
      labelX = Math.round((tileRightX + 678) / 2);
    } else if (tileCenterY < heroCenterY) {
      path = `M ${tileRightX} ${tileCenterY} H 744 V 386`;
      arrow = `<polygon class="arrow-fill" points="744,392 740,384 748,384" />`;
      labelY = tileCenterY;
      labelX = Math.round((tileRightX + 744) / 2);
    } else {
      path = `M ${tileRightX} ${tileCenterY} H 744 V 514`;
      arrow = `<polygon class="arrow-fill" points="744,508 740,516 748,516" />`;
      labelY = tileCenterY;
      labelX = Math.round((tileRightX + 744) / 2);
    }
    return { path, arrow, labelY, labelX };
  });

  const connectorSVG = connectors.map(c => `<path d="${c.path}" />${c.arrow}`).join('');
  const edgeLabels = edgeLabel
    ? connectors.map(c => `<span class="edge-label edge-label--ink" style="left:${c.labelX}px; top:${c.labelY}px;">${escapeHTML(edgeLabel)}</span>`).join('')
    : '';

  return `
    <style>
      .panel--PC {
        width: 900px;
        height: 900px;
        background: var(--panel-cream);
        padding: 0;
      }
      .panel--PC .tile { position: absolute; }
      .panel--PC .hero {
        left: ${heroX}px;
        top: 390px;
      }
      .panel--PC .tile--hero svg { width: 56px; height: 56px; }
      .panel--PC .tile--cream-soft {
        background: #FCFBF8;
        border: 1px solid #E4DFD5;
        border-radius: 18px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.06);
        flex-direction: column;
        gap: 8px;
      }
      .panel--PC .person-glyph .ring { border-color: ${accent}; }
      .panel--PC .connector-layer path { stroke: var(--connector-on-cream); stroke-width: 1.5; }
      .panel--PC .connector-layer .arrow-fill { fill: var(--connector-on-cream); }
      .panel--PC .edge-label--ink { color: var(--ink); background: var(--panel-cream); padding: 1px 6px; border-radius: 4px; }
      .panel--PC .headline-row {
        position: absolute;
        left: 64px; top: 64px;
      }
    </style>
    <section class="panel panel--PC">
      <svg class="connector-layer" viewBox="0 0 900 900" preserveAspectRatio="none">
        ${connectorSVG}
      </svg>
      ${edgeLabels}
      ${title ? `<div class="headline-row"><h1 class="panel__headline">${escapeHTML(title)}</h1></div>` : ''}
      ${tiles}
      <div class="tile tile--hero hero">${heroSVG(hubGlyph, accent)}</div>
    </section>`;
}
