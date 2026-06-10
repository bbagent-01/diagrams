# QB_STATUS — Diagram Engine

_Brightbase internal source of truth. QB reads this FIRST every turn, writes it LAST. Not Loren-facing (that's the Hub)._
_Last updated: 2026-06-04_

## What this is
Internal tool for Brightbase to mass-produce B2B SaaS technical diagrams for clients — on each client's own brand, at scale. Reference brands: Okta + Hightouch.

## Locked decisions (2026-05-26)
- **Operator:** Internal (Brightbase). Optimize for skilled-operator speed + control, not a foolproof public UI.
- **Branding:** Per-client. Brand = swappable token data (colors/fonts/logos), NEVER hard-coded. Client brand plugs on top of OUR style packs (not bespoke-per-client).
- **Output:** Editable vector. Render token-driven HTML/CSS/inline-SVG → SVG/PNG export, Figma import later. Loren explicitly OK with HTML/code as the medium as long as quality is top-tier.
- **Engine:** custom token-driven component library (approved). D2 fast-lane kept in reserve. Avoid Mermaid (ceiling too low) + Figma-API-as-core (reserve Figma as export target only).
- **First style pack + first diagram type:** OKTA look (Loren overrode my Hightouch rec).

## CRITICAL — the real Okta target style (from Loren's 5 attached refs, NOT the research)
Earlier research described Okta's **dev-docs auth-sequence** diagrams (pastel actor lanes, numbered steps, strictly flat). Loren's chosen refs are Okta's **MARKETING/product** diagrams — a DIFFERENT system. Build the pack from THIS:

- **Two background variants:** (a) warm cream panel ~`#EFE9DF`, ~28px radius, generous pad, on white; (b) blue-gradient panel ~`#3D45E5` (bottom-left) → `#8E92F0` (top-right) + soft white bloom top-right, ~28px radius.
- **Nodes:** white rounded tile (~110–120px, 18–24px radius, soft shadow) holding a line-icon OR brand logo OR person glyph (+ optional label). Uniform logo tiles (white circles for devices / white rounded squares for apps) unify heterogeneous logos. Accent pill-button: solid indigo `#4B4FE8`, 14px radius, white line-icon + white label, soft shadow. App-window card: white card w/ header (logo+title+divider), avatars, gray skeleton bars `#D9DCE3`.
- **Icons:** line-style monochrome (black on white / white on indigo), rounded consistent weight; person glyph w/ blue accent arcs; real full-color brand/OS logos. (Use Lucide for line icons.)
- **Connectors:** thin ~1.5px, warm-gray on cream / white on blue; orthogonal elbows + small arrowheads; bracket/tree splits; edge labels (e.g. "IdP").
- **Type:** sans-serif (Aktiv Grotesk-like; Inter/DM Sans fallback). Black headlines; medium labels; blue emphasis text `#3D43E8`.
- **Depth:** soft shadows + elevation on tiles/cards/pills (NOT strictly flat). Blue variant uses gradient bg; nodes stay flat white.
- **Palette:** indigo `#4B4FE8` (accent/pills), navy `#00297A` (check badge), blue text `#3D43E8`, cream `#EFE9DF`, gradient as above, white tiles, black icons/text, skeleton `#D9DCE3`.
- **Hero logo:** Okta sunburst = ring of ~16 tapered radial strokes, black, hollow center.
- **Feel:** clean, calm, premium, friendly. White tiles floating on cream or blue gradient, thin minimal connectors, sunburst hero, uniform logo tiles, soft depth.

The 5 refs (for later full coverage): 1) "Any source of truth" (cream, sources→Okta), 2) "Managed/unmanaged devices" (cream, Okta→verify→device-logo circles), 3) "Partner 1/2/3 → Okta" (blue, IdP connectors), 4) "Okta Admin → Partner Admin" (blue, admin tree w/ app-window cards), 5) "Configure Users" (blue, product-UI card).

## Architecture (token-driven HTML/SVG)
- `engine/tokens/<brand>.css` — CSS custom properties per client (`--accent`, `--panel-gradient`, `--hero-logo`, fonts…). Rebrand = swap this file.
- `engine/packs/okta-marketing.css` — the style pack: component classes.
- Components: panel(cream|blue), node-tile, logo-tile, pill-button, connector, app-window card, person-glyph, hero-logo.
- `diagrams/<name>.html` — content specs assembled from components, link tokens + pack.
- Rebrand demo: same diagram HTML, different linked token file.
- Render → self-contained HTML (browser → SVG/PNG; Figma import later).

## Atomic element library (build once, reuse forever)
Structural: node · actor · data store · connector · port · container · boundary · lane · canvas.
Content: title · node label · edge label · step badge · callout · legend · status badge · icon/logo.
Diagram types: architecture · data-flow · integration/network · sequence/auth · user journey · deployment · before/after · layered stack · marketing hero.

## Phases
- **P0 Foundations:** token schema + Okta marketing pack + atomic components + repo/deploy/Hub.
- **P1 Proof:** recreate simpler Okta refs end-to-end (token-driven) + rebrand demo.
- **P2:** rebrand polish + 2nd pack (Hightouch).
- **P3:** more diagram types + Figma export.
- **P4:** operator intake/refine UX + batch rebrand at scale.

## In flight
- (nothing actively building — Studio v1 just landed; paused on R1 + R2 verdicts)

## Awaiting Loren review
- **[R2]** Studio v1 — operator UI + parametric render endpoint + sources-hub + partners-hub archetypes. Live: https://diagrams.bbase.ai/studio.html
- **[R1]** Foundational proof: Ref-1 (cream "Any source of truth") + Ref-3 (blue "Partner→Okta") + Northwind rebrand on both. All 4 diagrams rendered + deployed; gallery + Hub live at https://diagrams.bbase.ai.
  - **Gating gap (be transparent next turn):** headless Chrome screenshot was killed by the env on both attempts (exit 143 / auto-bg killed). Could not visually pre-gate vs the 5 refs. Surfaced this honestly in the Hub note; Loren's eyes are the gate this round.
  - When R1 lands: depending on verdict, either iterate fixes or proceed to remaining refs (devices / admin tree / Configure Users card) to complete the Okta pack v1.

## Queued / backlog
- Recreate remaining refs: Ref-2 (devices), Ref-4 (admin tree), Ref-5 (Configure Users card).
- Build the Loren-facing **review Hub** (`review-hub.html`) once BUILD-1 lands — first item = the proof gallery.
- Hightouch pack (P2). Figma export path (P3). Operator intake/refine UI (P4).
- Deploy: `diagrams.bbase.ai` via the CLAUDE.md flow when ready to share live (not yet).

## Mechanics
- Project root: `/Users/lorenpolster/Claude/Projects/bbai-diagrams`
- Repo: `bbagent-01/diagrams` → https://github.com/bbagent-01/diagrams
- **Live: https://diagrams.bbase.ai** (auto-deploys on push to main via GH Action → Cloudflare Pages project `diagrams`; raw subdomain `diagrams-akt.pages.dev`)
- Hub (Loren-facing): `/index.html` → https://diagrams.bbase.ai/
- Studio (operator tool): `/studio.html` → https://diagrams.bbase.ai/studio.html
- Render endpoint: `/render.html` (param-driven; iframed by Studio and embeddable elsewhere)
- Plan doc: `/Diagram_Engine_Plan.html` → https://diagrams.bbase.ai/Diagram_Engine_Plan.html
- Gallery: `/gallery.html` → https://diagrams.bbase.ai/gallery.html
- Gating tooling note: in-harness headless Chrome screenshots fail (SIGTERM). Future option = Playwright via npx, or visit the live URL from a separate gating environment.
- Repo/deploy: not set up yet.
