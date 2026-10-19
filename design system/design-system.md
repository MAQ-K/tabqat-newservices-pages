# Tabqat design system

Extracted from the local website on 19 October 2026. This is a reference to the existing implementation, not a redesign. Values vary by page family; use the matching family rather than combining every token into one theme.

## Colors

### Brand and light surfaces

| Role | Value | Implementation |
|---|---|---|
| Primary brand teal | `#3fada2` | All `--rs-theme-*` aliases; insulation `--teal`; homepage buttons |
| Deep teal | `#2f7d75` | Insulation `--teal-deep`, light hover/text |
| Service interactive teal | `#0f766e` | Initial `.wp-scope --wp-teal`; later dark overrides differ |
| Heading navy | `#0d1b2a` | Insulation `--ink`; initial service `--wp-navy` |
| Light body | `#55636b` | Insulation `--body` |
| Light muted | `#7c888f` | Insulation `--muted` |
| Light divider | `#e6e9eb` | Insulation `--line` |
| Teal tint | `#f2faf9` | Insulation `--tint` |
| White | `#ffffff` | Light surfaces |
| Template heading / body | `#1f1f1f` / `#616161` | `--rs-title-primary` / `--rs-text-primary` |
| Template pale surface | `#f7f7f7` | `--rs-bg-primary` |

### Dark surfaces

| Role | Value | Implementation |
|---|---|---|
| Page | `#0a121a` | Dark insulation pages |
| Shared section background | `#0b1620` | Home v2, reviews, closing CTA |
| Alternate surface | `#0e1923` | Dark insulation; home v2 uses `#0e1c27` |
| Home v2 card | `#112230` | `--hv-card` |
| Heading | `#f3f7f9` | Dark heading text |
| Body | `#c3ced5` | Dark body text |
| Muted | `#93a4af` | Dark secondary text |
| Bright accent | `#5fd3c6` | Home v2 / reviews accent |
| Home v2 button hover | `#4fc4b7` | `.hv-btn:hover` |
| Dark insulation button hover | `#63cbc0` | `.ins-btn:hover` |
| Divider | `rgba(255,255,255,.09)` | Dark `--line` |
| Card border / hover | `rgba(255,255,255,.10)` / `rgba(63,173,162,.55)` | Dark insulation `--bd` / `--bd-hi` |
| Teal tint | `rgba(63,173,162,.12)` | Dark insulation `--tint` |
| Rating stars | `#fbbc05` | Shared reviews; template rating token is `#ffc62d` |

Dark insulation fill: `linear-gradient(to bottom,rgba(255,255,255,.065),rgba(255,255,255,.028) 60%,rgba(255,255,255,.016))`.
Reviews use teal and blue radial glows over `#0b1620`. Rebuilt service pages override some gradients with flat translucent fills in `sp-page.css`.

Sources: `assets/scss/utils/_root.scss`, `assets/css/insulation-hub.css`, `assets/css/dark-theme.css`, `assets/css/home-v2.css`, `assets/css/services.css`, `assets/css/wp-scope.css`, `assets/css/sp-page.css`.

## Typography

The Arabic site uses **Cairo**, with Arabic right-to-left layouts. `index.html` loads Cairo weights 200?1000 through Google Fonts. The SCSS template declares **Space Grotesk** as its base family; it is a template default, not the primary Arabic brand font. Preserve page-level Cairo overrides and inherited fonts on controls.

`assets/css/cairo.css` declares local Arabic and Latin variable WOFF2 subsets with `font-display:swap`, but its referenced `assets/fonts/cairo/` directory is absent from this checkout. No Cairo font binary is included in this extraction.

| Usage | Size | Weight | Line height |
|---|---|---|---|
| Base template body / paragraph | 18px / 17px | normal | body 1.5 |
| Base template H1?H6 | 68 / 52 / 38 / 28 / 24 / 20px | bold | varies by heading and breakpoint |
| Insulation hero H1 | 46px; 36px at ?991px; 28px at ?575px | inherited | 1.4 |
| Home v2 H2 | `clamp(26px,3vw,38px)` | 800 | 1.35 |
| Home v2 promise H2 | `clamp(26px,3.2vw,40px)` | 800 | 1.35 |
| Home v2 card title | 20px | 800 | inherited |
| Home v2 intro / card body | 17px / 16px | inherited | 1.9 / 1.8 |
| Home v2 eyebrow | 14px | 700 | inherited |
| Shared reviews H2 | `clamp(28px,3.4vw,42px)` | 800 | 1.25 |
| Shared review body | 16px | normal | 1.9 |
| CTA heading | `clamp(24px,2.8vw,34px)` | 800 | 1.35 |
| CTA button | 16px | 800 | inherited |
| Service summary card title / text | 17px / 15px | 800 / inherited | title inherited; text 1.85 |

Icon systems: Remix Icon and legacy Font Awesome selectors. Some production styles replace icon fonts with inline SVG masks; inspect the page stylesheet before assuming a font is required.

## Shadows

| Usage | CSS value | Source |
|---|---|---|
| Light floating service dock | `0 6px 24px rgba(13,27,42,.08)` | `insulation-hub.css` |
| Service image-card panel | `0 6px 18px rgba(13,27,42,.10)` | `wp-scope.css` |
| Service image-card panel hover | `0 14px 30px rgba(13,27,42,.18)` | `wp-scope.css` |
| Dark card resting | `0 4px 20px rgba(0,0,0,.30)` | `dark-theme.css --sh` |
| Dark card hover / dock | `0 10px 34px rgba(0,0,0,.45)` | `dark-theme.css --sh-hi` |
| Process step hover | `0 8px 20px rgba(63,173,162,.25)` | `dark-theme.css` |
| Reviews score panel | `0 24px 60px rgba(0,0,0,.35)` | `services.css` |
| Dark sticky header rule | `0 1px 0 rgba(255,255,255,.08)` | `dark-theme.css` |

Home v2 cards mostly use borders and small upward hover translations instead of shadows.

## Components

| Component | Selectors / source | Existing design and behavior |
|---|---|---|
| Header and navigation | `components/header-home.html`, `header-inner.html`; `.rs-header-one` | Logo, desktop links, dropdowns, social links, mobile hamburger; dark logo uses CSS white filter |
| Mobile offcanvas | `components/offcanvas.html` | Alternate mobile navigation and contact information |
| Theme switch | `.theme-toggle`, `assets/css/theme.css`, `assets/js/theme.js` | 40px circular control, 18px icon, teal hover; 3px focus outline offset 3px; dark theme via `html[data-theme="dark"]` |
| Hero / breadcrumb | `.ins-hero`, `.rs-breadcrumb-*` | Photo background with `rgba(6,17,28,.6)` overlay and centered title |
| Primary / ghost buttons | `.hv-btn`, `.hv-btn--ghost`, `home-v2.css` | Minimum height 52px, horizontal padding 26px, radius 12px, 16px/800 type; teal fill or transparent outline |
| Closing CTA buttons | `.tq-cta__btn`, `services.css` | Minimum height 52px, padding 0 28px, radius 12px; centered wrapping action row |
| Service image card | `.hv-svc`, `home-v2.css` | Radius 18px, 1px border, 3:2 image, 20?22px content padding, hover translateY(-4px) |
| Service summary card | `.sp-card`, `sp-page.css` | 22px padding (24px bottom), 10px internal gap, 24px teal icon, title and description, hover translateY(-3px) |
| Service carousel | `.wp-track`, `.wp-card`, `wp-scope.css` | Native horizontal scroll snap; image zoom 1.06, expanding text panel; inspect later overrides for final token values |
| Trust / statistics | `.ins-trust`, `.hv-stats`, `.sp-stats` | Highlight numbers with supporting labels; home v2 2-column stats, service trust bar 4 columns on desktop |
| Process steps | `.hv-steps`, `.ins-step` | Numbered cards with teal icon tiles and connecting lines; four to two to one columns |
| Project cards | `.hv-proj`, `.category-project-card` | Document or project image plus metadata; home v2 radius 18px, 18px padding |
| Certificates / products | `.hv-cert`, `.hv-prod` | Certificate image 5:7; product image 1:1; radius 16px outer, 10px image |
| Reviews | `components/reviews.html`, `.tq-reviews`, `.tq-rev` | Dark band, score panel, stars, 360px cards with 22px radius; mobile cards 290px; marquee pauses on hover/focus |
| FAQ | `.ins-faq`, `.wp-faq` | Accordion and native-details implementations exist; keep the matching page markup and behavior |
| Quote form | `.quote-form-group`, `assets/css/main.css` | Inputs radius 9px, padding 12px 14px, 15px type, `#dfe6e9` 1.5px border |
| Floating dock | `.ins-dock` | Fixed left edge, vertically centered, expands labels on hover/focus; hidden at ?1239px |
| Footer | `components/footer.html` | Shared logo, service links and contact/social information |

### Layout, shape and motion

- Light insulation content max-width: 1060px; small/default radii 4px / 8px.
- Home v2 section padding: 88px desktop, 64px at ?991px, 52px at ?575px. Typical card gaps 14?18px; split-section gap 48px.
- Home v2 service grid: 3 columns desktop, 2 at ?991px, 1 at ?575px. Certificate grid: 4 then 2 columns. Product grid: 6, then 3 at ?1199px, then 2 at ?575px.
- Common radii: buttons 12px, tiles 16px, cards 18px, about photo 20px, reviews/CTA 22px; pills 999px and avatars 50%.
- Common transitions: 0.25?0.3s; carousel `--wp-dur:.42s`, `--wp-ease:cubic-bezier(.22,.61,.36,1)`.
- Service focus ring: 3px teal with 3px offset. Home v2 disables transitions with reduced motion; reviews become a swipeable static row and hide duplicate cards.
- Preserve Arabic RTL flow and logical properties such as `margin-inline` and `inset-inline-end`.

## Assets

Copied originals are listed below. PNG and WebP logos are existing raster variants; no vector master was found among the active brand files. `tap-logo` is the site's favicon/preloader asset; `logo` is used in header/footer. Dark headers turn the existing logo white through `filter:brightness(0) invert(1)` rather than a separate white logo file.

Imagery is a small selection of the homepage hero, company/service photography and four service categories. It is supporting identity material, not replacement logo artwork. Generic template logos in `assets/images/logo/` and third-party client logos are excluded from the brand pack.

| Copied asset | Original path | Dimensions (px) |
|---|---|---|
| [logo.png](assets/logos/logo.png) | `assets/my-images/logo.png` | 316 ? 75 |
| [logo.webp](assets/logos/logo.webp) | `assets/my-images/logo.webp` | 316 ? 75 |
| [tap-logo.png](assets/logos/tap-logo.png) | `assets/my-images/tap-logo.png` | 125 ? 75 |
| [tap-logo.webp](assets/logos/tap-logo.webp) | `assets/my-images/tap-logo.webp` | 125 ? 75 |
| [home-hero.webp](assets/imagery/home-hero.webp) | `assets/my-images/homepage/main-slider/1.webp` | 1920 ? 920 |
| [about-waterproofing.webp](assets/imagery/about-waterproofing.webp) | `assets/my-images/homepage/about-us/2.webp` | 768 ? 576 |
| [service-iso.webp](assets/imagery/service-iso.webp) | `assets/my-images/homepage/our-services/iso.webp` | 600 ? 415 |
| [service-epoxy.webp](assets/imagery/service-epoxy.webp) | `assets/my-images/homepage/our-services/epoxy.webp` | 600 ? 415 |
| [service-injection.webp](assets/imagery/service-injection.webp) | `assets/my-images/homepage/our-services/injection.webp` | 600 ? 415 |
| [service-support.webp](assets/imagery/service-support.webp) | `assets/my-images/homepage/our-services/support.webp` | 600 ? 415 |

### Source and reuse notes

Paths in the reference sections are relative to the project root; asset links above are relative to this document. Copied files are byte-identical to their sources. Source code does not establish asset licensing or logo clear-space rules; those are not invented here. For exact final page styling, follow stylesheet order and inline overrides in the relevant HTML. The following appendix preserves the service scope declarations in source order, including overrides.

### Service scope token declarations

Source: `assets/css/wp-scope.css`. Repeated names below are intentional; selector scope and order matter.

```css
.wp-scope {
  --wp-navy:#0d1b2a;
  --wp-ink:#41505e;
  --wp-muted:#5b6a78;
  --wp-teal:#0F766E;
  --wp-teal-bright:#3fada2;
  --wp-panel:#f4f7f8;
  --wp-surface:#fff;
  --wp-line:#e3eaed;
  --wp-line-strong:#d0dade;
  --wp-fs-h2:32px;
  --wp-fs-sub:14.5px;
  --wp-fs-card-title:17px;
  --wp-fs-card:12.5px;
  --wp-card-h:380px;
  --wp-gap:26px;
  --wp-radius:12px;
  --wp-ease:cubic-bezier(.22,.61,.36,1);
  --wp-dur:.42s;
}
.wp-scope {
  --wp-fs-h2:28px;
  --wp-card-h:370px;
}
.wp-scope {
  --wp-fs-h2:24px;
  --wp-card-h:360px;
}
.wp-scope {
  --wp-r-lg:16px;
  --wp-r-md:12px;
  --wp-r-sm:8px;
  --wp-bd:rgba(13,27,42,.10);
  --wp-bd-soft:rgba(13,27,42,.07);
  --wp-bd-hi:rgba(15,118,110,.32);
  --wp-sh:0 4px 20px rgba(13,27,42,.04);
  --wp-sh-hi:0 8px 30px rgba(13,27,42,.07);
  --wp-fill:rgba(250,252,253,.8);
  --wp-wash:rgba(255,255,255,.3);
  --wp-ko-ease:cubic-bezier(.16,1,.3,1);
}
.wp-stats {
  --line:#e6e9eb;
  --ink:#0d1b2a;
  --muted:#7c888f;
}
.wp-scope {
  --wp-navy:#f3f7f9;
  --wp-ink:#c3ced5;
  --wp-muted:#93a4af;
  --wp-teal:#3fada2;
  --wp-teal-bright:#4fc4b7;
  --wp-panel:#111e29;
  --wp-surface:#0a121a;
  --wp-alt:#0e1923;
  --wp-deep:#060b10;
  --wp-line:rgba(255,255,255,.09);
  --wp-line-strong:rgba(255,255,255,.18);
  --wp-bd:rgba(255,255,255,.10);
  --wp-bd-soft:rgba(255,255,255,.07);
  --wp-bd-hi:rgba(63,173,162,.55);
  --wp-sh:0 4px 20px rgba(0,0,0,.30);
  --wp-sh-hi:0 10px 34px rgba(0,0,0,.45);
  --wp-fill:rgba(255,255,255,.04);
  --wp-wash:rgba(255,255,255,.025);
}
.wp-stats {
  --line:rgba(255,255,255,.12);
  --ink:#f3f7f9;
  --muted:#93a4af;
}
```
