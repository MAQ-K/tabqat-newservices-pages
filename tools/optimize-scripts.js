/* Ships each page only the JS plugins its markup uses, and loads GTM after first interaction.
 *
 * Run from anywhere:  node tools/optimize-scripts.js
 * Idempotent: re-run after adding a slider / popup / counter / ... to a page and the plugin comes back.
 * Fails (exit 1) if a page's script weight goes over BUDGET_KB (home/about pages excluded).
 * main.js guards every plugin call, so a page that lacks a plugin simply skips that feature.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
process.chdir(ROOT);

const BUDGET_KB = 400;
const BUDGET_EXEMPT = ['index.html', 'about-us.html', 'products.html', 'blogs.html', 'project-report.html'];
const MAIN_VER = '20261018';

// [file, feature that needs it (null = every page)] in load order. lenis is fetched by main.js on demand.
const P = 'plugins/', V = 'vendor/';
const ORDER = [
  [V + 'jquery-3.7.1.min.js', null],
  [P + 'waypoints.min.js', 'odometer'],
  [V + 'bootstrap.bundle.min.js', null],
  [P + 'meanmenu.min.js', null],
  [P + 'swiper.min.js', 'swiper'],
  [P + 'wow.min.js', 'wow'],
  [V + 'magnific-popup.min.js', 'magnific'],
  [V + 'isotope.pkgd.min.js', 'isotope'],
  [V + 'imagesloaded.pkgd.min.js', 'isotope'],
  [P + 'nice-select.min.js', 'select'],
  [P + 'jarallax.min.js', 'jarallax'],
  [V + 'ajax-form.js', 'form'],
  [P + 'easypie.js', 'easypie'],
  [P + 'headding-title.js', 'cdh'],
  [P + 'lenis.min.js', 'never'],
  [P + 'gsap.min.js', 'gsap'],
  [P + 'rs-anim-int.js', 'gsap'],
  [P + 'rs-scroll-trigger.min.js', 'gsap'],
  [P + 'rs-splitText.min.js', 'gsap'],
  [P + 'jquery.lettering.js', 'cdh'],
  [P + 'parallax-effect.min.js', 'parallax'],
  [P + 'jquery.appear.min.js', 'odometer'],
  [P + 'marquee.min.js', 'marquee'],
  [P + 'nouislider.min.js', 'noui'],
  [V + 'purecounter.js', 'purecounter'],
  [V + 'odometer.min.js', 'odometer'],
];

const FEATURES = {
  swiper: /rs-swiper|product-details-(nav|active)|rs-marquee-slide|text-slide-one/,
  wow: /class="(?:[^"]*\s)?wow(?:\s[^"]*)?"/,
  magnific: /popup-image|popup-video/,
  jarallax: /class="(?:[^"]*\s)?jarallax(?:\s[^"]*)?"/,
  select: /<select[\s>]/,
  purecounter: /purecounter|filesizecount/,
  odometer: /class="(?:[^"]*\s)?odometer(?:\s[^"]*)?"/,
  isotope: /class="(?:[^"]*\s)?(?:grid|grid-item)(?:\s[^"]*)?"/,
  parallax: /prallax-parent/,
  easypie: /easyPieChart/,
  noui: /id="slider-range"/,
  marquee: /\.marquee\(/,
  gsap: /gsap-rotate|gsap-move|scroll_reveal|gsap-fixed|gsap-marquee|rs-split-text-enable/,
  cdh: /cd-headline/,
  form: /id="contact-form"/,
};

const TAG = /[ \t]*<script src="assets\/js\/((?:plugins|vendor)\/[^"?]+)(?:\?[^"]*)?" defer>\s*<\/script>\s*\n?/g;
const GTM = /<script>\(function\(w,d,s,l,i\)\{w\[l\]=w\[l\]\|\|\[\];.*?"GTM-NBRW2ZDR"\);<\/script>/s;
const GTM_LAZY = '<script>(function(w,d,i){w.dataLayer=w.dataLayer||[];var s=0;function l(){if(s)return;s=1;w.dataLayer.push({"gtm.start":Date.now(),event:"gtm.js"});var j=d.createElement("script");j.async=true;j.src="https://www.googletagmanager.com/gtm.js?id="+i;d.head.appendChild(j)}["scroll","pointerdown","keydown","touchstart"].forEach(function(e){w.addEventListener(e,l,{once:true,passive:true})});setTimeout(l,5000)})(window,document,"GTM-NBRW2ZDR");</script>';

const size = f => fs.statSync(path.join('assets/js', f)).size;
const mainSize = fs.statSync('assets/js/main.js').size;
let changed = 0, over = [], before = 0, after = 0;

for (const f of fs.readdirSync('.').filter(x => x.endsWith('.html'))) {
  let s = fs.readFileSync(f, 'utf8');
  const orig = s;
  if (GTM.test(s)) s = s.replace(GTM, GTM_LAZY);
  if (!s.includes('src="assets/js/main.js')) { if (s !== orig) { fs.writeFileSync(f, s); changed++; } continue; }

  const markup = s.slice(s.indexOf('<body')).replace(/<script[\s\S]*?<\/script>/g, '');
  const need = k => k === null || (FEATURES[k] && FEATURES[k].test(markup));
  let firstAt = -1, removed = [];
  s = s.replace(TAG, (m, file, off) => { if (firstAt < 0) firstAt = off; removed.push(file); return ''; });
  if (firstAt < 0) continue;
  const keep = ORDER.filter(([, k]) => need(k)).map(([file]) => file);
  const block = keep.map(file => `<script src="assets/js/${file}" defer></script>\n`).join('');
  s = s.slice(0, firstAt) + block + s.slice(firstAt);
  s = s.replace(/src="assets\/js\/main\.js(?:\?[^"]*)?"/, `src="assets/js/main.js?v=${MAIN_VER}"`);
  before += removed.reduce((a, r) => a + size(r), 0);
  const kb = (keep.reduce((a, r) => a + size(r), 0) + mainSize) / 1024;
  after += keep.reduce((a, r) => a + size(r), 0);
  if (kb > BUDGET_KB && !BUDGET_EXEMPT.includes(f)) over.push(`${f} ${kb.toFixed(0)}KB`);
  if (s !== orig) { fs.writeFileSync(f, s); changed++; }
}
console.log(`pages changed: ${changed}; plugin JS across pages ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);
if (over.length) { console.error('OVER BUDGET (' + BUDGET_KB + 'KB):\n' + over.join('\n')); process.exit(1); }
