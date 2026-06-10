// ============================================================
// engine/archetypes/sources-hub.js
// Renders the "Sources → Hub" archetype (cream or blue).
//
// API:
//   renderSourcesHub({
//     title,           // headline, e.g. "Any source of truth"
//     hubName,         // optional label under the hero (unused on cream, ignored if empty)
//     hubGlyph,        // glyph for hero (empty/"okta" → Okta sunburst)
//     containerLabel,  // default "Out of box integrations"
//     items,           // [{label, icon}] — icon defaults to user-round
//     style,           // "cream" | "blue"
//     accent           // hex, used for hero monogram fill
//   }) → HTML string
//
// Matches the visual fidelity of diagrams/any-source-of-truth.html
// for style="cream". For style="blue", adapts the same flow to a
// blue-gradient panel with small white tiles converging via the
// pack's connector layer.
// ============================================================

import { iconSVG, heroSVG, escapeHTML } from './lib.js';

export function renderSourcesHub({
  title = 'Any source of truth',
  hubName = '',
  hubGlyph = '',
  containerLabel = 'Out of box integrations',
  items = [],
  style = 'cream',
  accent = '#4B4FE8'
} = {}) {
  const safeItems = (items || [])
    .map(it => (typeof it === 'string' ? { label: it, icon: 'user-round' } : it))
    .filter(it => it && it.label)
    .map(it => ({ label: it.label, icon: it.icon || 'user-round' }))
    .slice(0, 6);

  return style === 'blue'
    ? renderBlue({ title, hubName, hubGlyph, containerLabel, items: safeItems, accent })
    : renderCream({ title, hubName, hubGlyph, containerLabel, items: safeItems, accent });
}

// ---------- CREAM variant ----------
// Mirrors diagrams/any-source-of-truth.html layout 1:1 so renders
// drop into the same visual envelope as the static reference.
function renderCream({ title, hubGlyph, containerLabel, items, accent }) {
  const pills = items.map(it => `
    <div class="pill">
      <span class="pill__icon">${iconSVG(it.icon)}</span>
      <span class="pill__label">${escapeHTML(it.label)}</span>
    </div>`).join('');

  return `
    <style>
      .panel--A {
        width: 900px;
        height: 860px;
        display: flex;
        flex-direction: column;
      }
      .panel--A .headline-row { margin-bottom: 48px; }
      .flow-row {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 0;
      }
      .flow-row .sources-card { width: 58%; flex: 0 0 58%; }
      .flow-row .connector-h {
        flex: 1 1 auto;
        min-width: 40px;
        margin: 0 8px 0 28px;
      }
      .flow-row .tile--hero { margin-left: 0; }
      .tile--hero svg { width: 56px; height: 56px; }
    </style>
    <section class="panel panel--cream panel--A">
      <div class="headline-row">
        <h1 class="panel__headline">${escapeHTML(title)}</h1>
      </div>
      <div class="flow-row">
        <div class="sources-card">
          <div class="sources-card__head">
            <span class="checkbox">
              <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </span>
            <span class="sources-card__label">${escapeHTML(containerLabel)}</span>
          </div>
          <div class="pill-stack">${pills}</div>
        </div>
        <div class="connector-h"></div>
        <div class="tile tile--hero">${heroSVG(hubGlyph, accent)}</div>
      </div>
    </section>`;
}

// ---------- BLUE variant ----------
// Same archetype on the gradient panel. Tiles stack vertically on the
// left as small soft-white tiles (icon + label, person-glyph style),
// converging on the hero via the connector-layer SVG. Coordinate space
// is 900x860, 1:1 with px so connector math is straightforward.
function renderBlue({ title, hubGlyph, containerLabel, items, accent }) {
  // Source-tile vertical layout: figure out per-tile Y positions so
  // they fan around a central horizontal axis. Tiles are 200x68,
  // gap 22px. Center the stack around y = 480.
  const tileW = 200;
  const tileH = 68;
  const tileX = 96;
  const gap = 22;
  const heroX = 684;
  const heroY = 480; // hero top; hero is 120x120, center at 744,540
  const stackH = items.length * tileH + (items.length - 1) * gap;
  const stackTop = 480 + 60 - stackH / 2; // align hero center with stack center
  const centerHeroY = heroY + 60;         // 540

  const tiles = items.map((it, i) => {
    const y = stackTop + i * (tileH + gap);
    return `
      <div class="src-tile" style="left:${tileX}px; top:${y}px;">
        <span class="src-tile__icon">${iconSVG(it.icon)}</span>
        <span class="src-tile__label">${escapeHTML(it.label)}</span>
      </div>`;
  }).join('');

  // Connector paths: from right edge of each tile → horizontal run →
  // vertical drop/rise into the hero edge nearest that tile's row.
  const tileRightX = tileX + tileW; // 296
  const connectors = items.map((_, i) => {
    const y = Math.round(stackTop + i * (tileH + gap) + tileH / 2);
    // Route into the hero: top edge if above center, bottom edge if below,
    // left edge if roughly aligned. Threshold 18px around center.
    let path, arrow;
    if (Math.abs(y - centerHeroY) < 18) {
      // straight horizontal into hero left edge (684, y)
      path = `M ${tileRightX} ${y} H 678`;
      arrow = `<polygon class="arrow-fill" points="684,${y} 676,${y - 4} 676,${y + 4}" />`;
    } else if (y < centerHeroY) {
      // right then DOWN into hero top (744, 480)
      path = `M ${tileRightX} ${y} H 744 V 476`;
      arrow = `<polygon class="arrow-fill" points="744,482 740,474 748,474" />`;
    } else {
      // right then UP into hero bottom (744, 600)
      path = `M ${tileRightX} ${y} H 744 V 604`;
      arrow = `<polygon class="arrow-fill" points="744,598 740,606 748,606" />`;
    }
    return `<path d="${path}" />${arrow}`;
  }).join('');

  return `
    <style>
      .panel--SB {
        width: 900px;
        height: 900px;
      }
      .panel--SB .headline-row {
        padding: 64px 64px 0;
      }
      .panel--SB .panel__headline { color: #FFFFFF; }
      .panel--SB .src-tile {
        position: absolute;
        width: 200px;
        height: 68px;
        background: #F5F6FF;
        border-radius: 16px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.10);
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 18px;
      }
      .panel--SB .src-tile__icon {
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--ink, #1A1A1A);
        flex: 0 0 auto;
      }
      .panel--SB .src-tile__icon svg { width: 28px; height: 28px; }
      .panel--SB .src-tile__label {
        font-size: 15px;
        font-weight: 500;
        color: var(--ink, #1A1A1A);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .panel--SB .tile--hero {
        position: absolute;
        left: 684px;
        top: 480px;
      }
      .panel--SB .tile--hero svg { width: 56px; height: 56px; }
      .panel--SB .container-badge {
        position: absolute;
        left: 64px;
        top: 130px;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        color: #FFFFFF;
        font-size: 14px;
        font-weight: 500;
        opacity: 0.92;
      }
      .panel--SB .container-badge .checkbox {
        width: 20px; height: 20px;
        background: rgba(255,255,255,0.22);
      }
      .panel--SB .container-badge .checkbox svg {
        stroke: #FFFFFF;
      }
    </style>
    <section class="panel panel--blue panel--SB">
      <svg class="connector-layer" viewBox="0 0 900 900" preserveAspectRatio="none">
        ${connectors}
      </svg>
      <div class="headline-row">
        <h1 class="panel__headline">${escapeHTML(title)}</h1>
      </div>
      <div class="container-badge">
        <span class="checkbox">
          <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </span>
        <span>${escapeHTML(containerLabel)}</span>
      </div>
      ${tiles}
      <div class="tile tile--hero">${heroSVG(hubGlyph, accent)}</div>
    </section>`;
}
