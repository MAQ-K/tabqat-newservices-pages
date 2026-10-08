/**
 * build-theme.js
 * Generates assets/css/theme-auto.css: the dark-theme overrides for every light
 * colour used across the site's stylesheets, <style> blocks and inline style="" attributes.
 *
 * Every rule is scoped to html[data-theme="dark"], so the light theme is the site as
 * authored. Light backgrounds become dark panels, dark text becomes light, and borders
 * become faint lines, using the palette of the dark services pages (see theme.css).
 * Hand-tuned exceptions live in theme.css, which loads after this file and wins.
 *
 * Run this whenever you change colours in a stylesheet or page:
 *   node tools/build-theme.js
 */

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const STYLESHEETS = [
    'assets/css/main.css',
    'assets/css/wp-scope.css',
    'assets/css/plugins/nice-select.css',
];
// Pages with their own standalone styling (already dark / internal docs).
const SKIP_PAGES = new Set(['location.html', 'hub-content-final.html', 'hub-wireframe-structure-en.html']);
const PREFIX = 'html[data-theme="dark"]';

// ---- dark palette (same as the services pages) ----
const P = {
    page: '#0a121a',     // section / page background
    panel: '#0e1923',    // cards, boxes
    raised: '#16232f',   // light-grey fills (inputs, chips, placeholders)
    ink: '#f3f7f9',      // headings
    body: '#c3ced5',     // body copy
    muted: '#93a4af',    // secondary copy
    teal: '#3fada2',
    tealHi: '#63cbc0',
};

// ---------------------------------------------------------------- colour helpers
const NAMED = { white: '#ffffff', black: '#000000', whitesmoke: '#f5f5f5', gainsboro: '#dcdcdc',
    lightgray: '#d3d3d3', lightgrey: '#d3d3d3', silver: '#c0c0c0', gray: '#808080', grey: '#808080',
    darkgray: '#a9a9a9', dimgray: '#696969', ghostwhite: '#f8f8ff', aliceblue: '#f0f8ff', snow: '#fffafa' };
const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\b(?:white|black|whitesmoke|gainsboro|lightgray|lightgrey|silver|gray|grey|darkgray|dimgray|ghostwhite|aliceblue|snow)\b/g;

function parseColor(s) {
    s = s.toLowerCase();
    if (NAMED[s]) s = NAMED[s];
    if (s[0] === '#') {
        let h = s.slice(1);
        if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('');
        if (h.length !== 6 && h.length !== 8) return null;
        return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16),
            a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
    }
    const m = s.match(/rgba?\(([^)]*)\)/);
    if (!m) return null;
    const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
    if (p.length < 3 || p.some(isNaN)) return null;
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
}
function lum({ r, g, b }) {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function hsl({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l };
    const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return { h: h * 60, s, l };
}
function withAlpha(hex, a) {
    if (a >= 1) return hex;
    const c = parseColor(hex);
    return `rgba(${c.r},${c.g},${c.b},${+a.toFixed(3)})`;
}
const isTeal = h => h >= 150 && h <= 200;
const sameColor = (s, c) => { const p = parseColor(s); return p && p.r === c.r && p.g === c.g && p.b === c.b && Math.abs(p.a - c.a) < 0.01; };

// light background -> dark surface. Returns null when no change is needed.
function mapBg(c, isSection) {
    const L = lum(c), { h, s } = hsl(c);
    if (c.a === 0) return null;
    if (L > 0.75) {
        if (s > 0.3 && L < 0.97) {       // pastel tint (teal / pink / yellow badges)
            return c.a < 1 ? `hsla(${h.toFixed(0)},40%,22%,${c.a})` : `hsl(${h.toFixed(0)},30%,14%)`;
        }
        if (c.a < 0.5) return null;              // translucent white overlay, already made for dark areas
        if (c.a < 1) return withAlpha(P.panel, c.a);
        if (L > 0.97) return isSection ? P.page : P.panel;
        return isSection ? P.page : P.raised;   // light greys (#f7f7f7 etc.)
    }
    if (L > 0.45 && s < 0.2) return withAlpha(P.raised, c.a);   // mid greys
    return null;
}
// dark text -> light text
function mapText(c) {
    const L = lum(c), { h, s } = hsl(c);
    if (c.a === 0 || L > 0.45) return null;
    if (s > 0.35 && L > 0.012) {                    // coloured text
        if (isTeal(h)) return withAlpha(L < 0.1 ? P.tealHi : P.teal, c.a);
        if (L > 0.2) return null;                    // bright enough already
        if (L < 0.06) return withAlpha(P.ink, c.a);  // near-black navy / green reads as plain text
        return `hsla(${h.toFixed(0)},70%,72%,${c.a})`;
    }
    if (L < 0.04) return withAlpha(P.ink, c.a);
    if (L < 0.25) return withAlpha(P.body, c.a);
    return withAlpha(P.muted, c.a);
}
// borders / dividers -> faint light lines
function mapLine(c) {
    const L = lum(c), { s } = hsl(c);
    if (c.a === 0 || s > 0.35) return null;           // keep brand-coloured borders
    if (L > 0.5) return c.a < 1 ? null : 'rgba(255,255,255,.1)';
    if (c.a < 1) return `rgba(255,255,255,${+Math.min(0.18, c.a * 1.6 + 0.04).toFixed(3)})`;
    if (L < 0.25) return 'rgba(255,255,255,.14)';
    return null;
}

// light, solid box-shadow rings (used as white frames) -> faint line
function mapShadow(c) {
    return lum(c) > 0.75 && c.a >= 0.5 && hsl(c).s < 0.3 ? 'rgba(255,255,255,.08)' : null;
}

function kindOf(prop) {
    if (prop === 'box-shadow') return 'shadow';
    if (prop === 'background' || prop === 'background-color') return 'bg';
    if (prop === 'color' || prop === 'fill' || prop === 'stroke' || prop === '-webkit-text-fill-color' || prop === 'caret-color') return 'text';
    if (/^(border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-color)?|outline(-color)?|column-rule(-color)?|text-decoration-color)$/.test(prop)) return 'line';
    return null;
}

// ---------------------------------------------------------------- variables
const VARS = {};
function collectVars(css) {
    for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+)/g)) VARS[m[1]] = m[2].trim();
}
function resolveVars(v, depth = 0) {
    if (depth > 8) return v;
    return v.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\))?[^()]*))?\)/g, (all, name, fb) => {
        const val = VARS[name] !== undefined ? VARS[name] : fb;
        return val === undefined ? all : resolveVars(val, depth + 1);
    });
}

function transformValue(prop, value, isSection) {
    const kind = kindOf(prop);
    if (!kind) return null;
    let v = value.replace(/\s*!important\s*$/i, '');
    const important = v.length !== value.length;
    if (/var\(/.test(v)) v = resolveVars(v);
    if (/var\(/.test(v)) return null;
    if (kind === 'bg' && /url\(/i.test(v) && !/gradient/i.test(v)) {
        // background shorthand with an image: only swap the colour layer
        const col = (v.match(COLOR_RE) || []).map(parseColor).filter(Boolean).pop();
        const out = col && mapBg(col, isSection);
        return out ? { prop: 'background-color', value: out, important } : null;
    }
    let changed = false;
    const out = v.replace(COLOR_RE, tok => {
        const c = parseColor(tok);
        if (!c) return tok;
        const m = kind === 'bg' ? mapBg(c, isSection) : kind === 'text' ? mapText(c) : kind === 'shadow' ? mapShadow(c) : mapLine(c);
        if (m && m.toLowerCase() !== tok.toLowerCase() && !sameColor(m, c)) { changed = true; return m; }
        return tok;
    });
    return changed ? { prop, value: out, important } : null;
}

// ---------------------------------------------------------------- tiny CSS parser
function stripComments(css) { return css.replace(/\/\*[\s\S]*?\*\//g, ''); }
function parseBlocks(css) {
    const out = [];
    let i = 0;
    while (i < css.length) {
        const open = css.indexOf('{', i);
        if (open < 0) break;
        const head = css.slice(i, open).trim();
        let depth = 1, j = open + 1;
        while (j < css.length && depth) { if (css[j] === '{') depth++; else if (css[j] === '}') depth--; j++; }
        const body = css.slice(open + 1, j - 1);
        const at = head.match(/@[^;]*$/);   // drop stray "@import ...;" before the block
        const h = at ? at[0].trim() : head.replace(/^[^{}]*;/, '').trim();
        if (h.startsWith('@')) out.push({ at: h, children: /^@(media|supports|layer|container)/i.test(h) ? parseBlocks(body) : null });
        else out.push({ sel: h, decls: body });
        i = j;
    }
    return out;
}
function splitSelectors(sel) {
    const parts = []; let depth = 0, cur = '';
    for (const ch of sel) {
        if (ch === '(' || ch === '[') depth++;
        if (ch === ')' || ch === ']') depth--;
        if (ch === ',' && !depth) { parts.push(cur.trim()); cur = ''; } else cur += ch;
    }
    if (cur.trim()) parts.push(cur.trim());
    return parts;
}
function scopeSelector(s) {
    if (/^:root\b/.test(s)) return PREFIX + s.slice(5);
    if (/^html\b/.test(s)) return PREFIX + s.slice(4);
    return PREFIX + ' ' + s;
}
const SECTION_RE = /(area|section|wrapper|main|page|body|-bg|banner|hero|breadcrumb)\b[^ ]*$/i;

function convertRule(sel, decls) {
    if (/::?-webkit-scrollbar|::selection|@|data-theme/.test(sel)) return '';
    const isSection = /^(html|body)$/.test(sel.trim()) || SECTION_RE.test(splitSelectors(sel)[0] || '');
    const out = [];
    for (const d of decls.split(';')) {
        const k = d.indexOf(':');
        if (k < 0) continue;
        const prop = d.slice(0, k).trim().toLowerCase();
        if (prop.startsWith('--')) continue;
        const t = transformValue(prop, d.slice(k + 1).trim(), isSection);
        if (t) out.push(`${t.prop}:${t.value}${t.important ? ' !important' : ''}`);
    }
    if (!out.length) return '';
    return `${splitSelectors(sel).map(scopeSelector).join(',')}{${out.join(';')}}`;
}
function convertBlocks(blocks) {
    let out = '';
    for (const b of blocks) {
        if (b.at) {
            if (b.children) { const inner = convertBlocks(b.children); if (inner) out += `${b.at}{\n${inner}}\n`; }
        } else {
            const r = convertRule(b.sel, b.decls);
            if (r) out += r + '\n';
        }
    }
    return out;
}

// ---------------------------------------------------------------- inline style="" attributes
function convertInlineStyle(style) {
    const out = [];
    for (const d of style.split(';')) {
        const k = d.indexOf(':');
        if (k < 0) continue;
        const prop = d.slice(0, k).trim().toLowerCase();
        const raw = d.slice(k + 1).trim();
        const t = transformValue(prop, raw, false);
        if (!t) continue;
        // match the declaration exactly as written in the attribute
        const literal = d.trim();
        out.push(`${PREFIX} [style*="${literal.replace(/"/g, '\\"')}"]{${t.prop}:${t.value} !important}`);
    }
    return out;
}

// ---------------------------------------------------------------- main
const pages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && !SKIP_PAGES.has(f));
const sources = STYLESHEETS.map(f => ({ name: f, css: fs.readFileSync(path.join(ROOT, f), 'utf8') }));
const inlineAttrs = new Set();
for (const p of pages) {
    const html = fs.readFileSync(path.join(ROOT, p), 'utf8');
    let n = 0;
    for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) sources.push({ name: `${p} <style #${++n}>`, css: m[1] });
    for (const m of html.matchAll(/\sstyle="([^"]*)"/gi)) inlineAttrs.add(m[1]);
}
sources.forEach(s => collectVars(stripComments(s.css)));

let css = `/* GENERATED by tools/build-theme.js — do not edit by hand; put tweaks in theme.css. */\n`;
const seen = new Set();
for (const s of sources) {
    // drop rules already emitted from an earlier source (pages repeat the same <style> blocks)
    const body = convertBlocks(parseBlocks(stripComments(s.css)))
        .split('\n').filter(line => !line.startsWith(PREFIX) || (!seen.has(line) && seen.add(line)))
        .join('\n').replace(/@[^{}]+\{\s*\}\n?/g, '').trim();
    if (body) css += `\n/* ---- ${s.name} ---- */\n${body}\n`;
}
const attrRules = new Set();
for (const st of inlineAttrs) convertInlineStyle(st).forEach(r => attrRules.add(r));
css += `\n/* ---- inline style="" attributes ---- */\n${[...attrRules].join('\n')}\n`;

const outFile = path.join(ROOT, 'assets/css/theme-auto.css');
fs.writeFileSync(outFile, css);
console.log(`theme-auto.css: ${css.split('\n').length} lines from ${sources.length} sources, ${attrRules.size} inline-attribute rules`);
