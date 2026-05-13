# CLAUDE.md — Mendocino Labs Website Project

Claude Code reads this file automatically at session start.
No need to re-explain the project each session.

## Project Location

```
/home/oamtester/Desktop/website_project/
├── atg_landing.html        ← main landing page (single-file, all inline CSS+JS)
└── content/                ← real product photos
    ├── singleantenna.png   ← ABR modem (black box, left side) + white antenna
    ├── DUAL_system.png     ← ABR modem + dual antenna product shot
    ├── antennaonplane_1.jpeg ← plane belly, no antenna visible (landing gear shot)
    ├── antennaonplane_2.jpeg ← plane belly WITH ATG antenna installed (use this one)
    ├── groundTower.jpg     ← ATG ground tower (full lattice tower, trees, blue sky)
    └── Antenna.jpg         ← Close-up of sector antennas on tower crossbar
```

## Design System

Single-file HTML page — all CSS and JS are inline. No build tools, no npm, no framework.
Open directly in browser: `atg_landing.html`

### Color Palette (CSS vars in `:root`)
| Variable     | Value     | Use                        |
|--------------|-----------|----------------------------|
| `--bg`       | `#04080f` | Page background            |
| `--bg2`      | `#070d1a` | Alternate section bg       |
| `--surface`  | `#0c1526` | Cards, panels              |
| `--border`   | `#1a2e50` | Card borders               |
| `--accent`   | `#00c8ff` | Primary accent (cyan)      |
| `--accent2`  | `#0066ff` | Secondary accent (blue)    |
| `--accent3`  | `#00ff9d` | Highlight green            |
| `--green`    | `#30A46C` | Mendocino Labs brand green |
| `--muted`    | `#6b8aad` | Body/secondary text        |

### Mendocino Labs Logo
Real SVG extracted from mendocinolabs.com favicon — three angled rounded rectangles in green:
```svg
<svg width="32" height="28" viewBox="0 0 47 41" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="7.49952" height="41.7644" rx="3.74976" transform="matrix(0.954363 0.29865 -0.38984 0.920883 39.1313 0)" fill="#30A46C"/>
  <rect width="7.49952" height="37.5879" rx="3.74976" transform="matrix(0.954363 0.29865 -0.38984 0.920883 26.0781 4.0929)" fill="#2F7C57"/>
  <rect width="7.49952" height="33.4115" rx="3.74976" transform="matrix(0.954363 0.29865 -0.38984 0.920883 13.0254 7.36707)" fill="#20573E"/>
</svg>
```
Use `width="32" height="28"` in nav, `width="30" height="26"` in footer.

### Motion / Animation Patterns
- **Scroll reveal**: `.reveal`, `.reveal-left`, `.reveal-right` classes — opacity+transform, toggled to `.visible` by IntersectionObserver at 10% threshold
- **Stagger delays**: `.delay-1` through `.delay-5` (0.1s to 0.6s)
- **Animated counters**: `data-target="300" data-suffix="+"` on `.stat-number` elements — cubic-ease count-up on scroll into view
- **Canvas animations**: hero particle network, coverage map, mini flight map — all pure JS canvas, no libraries
- **Hero flight path**: SVG `<path id="trail">` animated via `getTotalLength()` + `getPointAtLength(t)` — plane dot travels along path
- **Signal flow nodes**: `.flow-arrow .signal-anim` — small dot animates left-to-right along connector

## Current Stats (Stats Bar)
| Stat | Value |
|------|-------|
| Ground Sites | 300+ |
| Network Uptime SLA | 99.9% |
| Peak Downlink Speed | 30 Mbps |
| Typical Latency | 75 ms |

## Page Sections (in order)
1. **Nav** — fixed, blurs on scroll, Mendocino logo SVG + wordmark
2. **Hero** — particle canvas bg, SVG flight path animation, hero badge, CTA buttons
3. **Stats Bar** — 4-column animated counters
4. **ATG Section** (`#atg`) — equipment photos (3-col grid), signal flow diagram, 3 step cards
5. **Features** — 4 alternating feature rows with real photos and live metric cards
6. **Coverage Map** (`#coverage`) — animated canvas map with ground sites + active flights
7. **Tech Specs** (`#specs`) — 3×2 spec cards
8. **Solutions** (`#solutions`) — 5 solution cards (ATG featured full-width + 4 others)
9. **Testimonial** — centered pull quote
10. **CTA** — contact card with glow animation
11. **Footer** — logo + links

## Solutions on the Page
| ID | Name | CSS Class | Icon |
|----|------|-----------|------|
| ATG | SkyConnect Air-to-Ground Network | `sol-blue` (featured banner) | ✈ |
| LTE/5G E2E | LTE / 5G End-to-End Solutions | `sol-blue` | 📶 |
| Open5G | Open 5G Core | `sol-green` | 🔓 |
| Private5G | Private 5G Networks | `sol-purple` | 🏭 |
| AI | AI-Based Telecom Solutions | `sol-orange` | 🤖 |

Each solution card uses a `--sol-c` CSS variable for its accent color (border glow on hover, label color, icon background).

## ABR Photo Crop Technique
`singleantenna.png` shows the black ABR modem box (left) + white antenna (right).
To show only the ABR box, use:
```css
.abr-crop img {
  object-fit: cover;
  object-position: left center;
  width: 65%;
}
```

## Key Links
- Live site reference: https://www.mendocinolabs.com/
- Contact: contact@mendocinolabs.com
- Logo SVG source: https://www.mendocinolabs.com/favicon.svg

## What NOT to do
- Do not introduce build tools, npm, webpack, or React — keep it single-file HTML
- Do not use external CDN links (page must work fully offline with local content/ images)
- Do not add libraries (Chart.js, Three.js etc.) — all animations are pure canvas/CSS
- Do not change the color palette without being asked — the dark navy theme is intentional
- Do not remove the Mendocino Labs SVG logo — it was hand-extracted from their site
