/**
 * embed-components.js
 * Reads header-inner.html, offcanvas.html, footer.html
 * and injects them directly into every HTML page.
 *
 * Run this whenever you edit a component:
 *   node embed-components.js
 */

const fs   = require('fs');
const path = require('path');
const base = 'd:/Work/tabqat 21-6-2026';

// ── Read component files ──────────────────────────────────────────
const HEADER  = fs.readFileSync(base + '/components/header-inner.html',  'utf8').trim();
const CANVAS  = fs.readFileSync(base + '/components/offcanvas.html',     'utf8').trim();
const FOOTER  = fs.readFileSync(base + '/components/footer.html',        'utf8').trim();

// ── Get all root HTML pages (skip index — it has inline header) ───
const skip = new Set(['index.html','project-report.html','service-pages-plan.html']);
const files = fs.readdirSync(base)
    .filter(f => f.endsWith('.html') && !skip.has(f));

let updated = 0;
let skipped = 0;

for (const f of files) {
    const filePath = path.join(base, f);
    let c = fs.readFileSync(filePath, 'utf8');

    // Replace site-header placeholder with actual header HTML
    const newC = c
        .replace(
            /<div id="site-header">[\s\S]*?<\/div>/,
            `<div id="site-header">\n${HEADER}\n</div>`
        )
        .replace(
            /<div id="site-offcanvas">[\s\S]*?<\/div>/,
            `<div id="site-offcanvas">\n${CANVAS}\n</div>`
        )
        .replace(
            /<div id="site-footer">[\s\S]*?<\/div>/,
            `<div id="site-footer">\n${FOOTER}\n</div>`
        );

    if (newC !== c) {
        fs.writeFileSync(filePath, newC, 'utf8');
        updated++;
    } else {
        skipped++;
    }
}

console.log(`Done: ${updated} pages updated, ${skipped} already up to date`);
console.log('');
console.log('NOTE: Run this script again whenever you edit:');
console.log('  components/header-inner.html');
console.log('  components/offcanvas.html');
console.log('  components/footer.html');
