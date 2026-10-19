"""Build the deployable copy of the site in ./upload.

Only what the live site actually uses is copied:
  1. live pages  = every .html reachable through links from index.html, plus the
                   sitemap.xml pages that exist (HTML comments are ignored, so links
                   inside commented-out sections don't count)
  2. their files = everything those pages reference (src / href / srcset /
                   data-background / form action / og:image ...), every url()/@import
                   inside the CSS they load, every 'assets/...' path inside the JS they
                   load, and the header/offcanvas/footer fragments components-loader.js
                   fetches.

Then, in the upload copy only (the source files are never touched):
  - photos wider than 1920px are scaled down and re-encoded in the same format,
    kept only when the result is smaller;
  - hand-written CSS is minified (comments and whitespace; strings untouched);
  - an .htaccess adds gzip/brotli compression and browser caching.

Usage:  python tools/build-upload.py
"""
import io
import os
import re
import shutil
import sys
from urllib.parse import unquote, urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "upload")
SITE = "tabqat.com.sa"
EXTRA = ["robots.txt", "sitemap.xml", "favicon.ico", "favicon-96x96.png"]   # served as-is
FRAGMENTS = ["components/header-home.html", "components/header-inner.html",
             "components/offcanvas.html", "components/footer.html"]
MAX_W = 1920

missing = {}          # referenced file -> first file that referenced it


def read(p):
    with io.open(os.path.join(ROOT, p), encoding="utf-8", errors="replace") as f:
        return f.read()


def strip_comments(html):
    # keep IE conditional / nothing special here; scripts keep their own // comments
    return re.sub(r"<!--.*?-->", "", html, flags=re.S)


def local(ref, base_dir=""):
    """Map a reference to a project-relative path, or None if it isn't a local file."""
    ref = ref.strip()
    if not ref or ref.startswith(("#", "data:", "mailto:", "tel:", "javascript:", "//")):
        return None
    u = urlparse(ref)
    if u.scheme in ("http", "https"):
        if u.netloc.replace("www.", "") != SITE:
            return None
        path = u.path.lstrip("/") or "index.html"
    elif u.scheme:
        return None
    else:
        path = u.path
        if path.startswith("/"):
            path = path.lstrip("/")
        else:
            path = os.path.normpath(os.path.join(base_dir, path)).replace("\\", "/")
    path = unquote(path)
    if path.endswith("/"):
        path += "index.html"
    return path or None


ATTR = re.compile(r'''\b(?:src|href|data-background|data-bg|data-src|poster|action)\s*=\s*["']([^"']+)["']''', re.I)
META = re.compile(r'''\bcontent\s*=\s*["'](https?://[^"']+)["']''', re.I)     # og:image etc.
SRCSET = re.compile(r'''\bsrcset\s*=\s*["']([^"']+)["']''', re.I)
CSSURL = re.compile(r'''url\(\s*['"]?([^'")]+?)['"]?\s*\)''', re.I)
IMPORT = re.compile(r'''@import\s+(?:url\()?\s*['"]([^'"]+)['"]''', re.I)
JSPATH = re.compile(r'''['"]((?:assets|components)/[^'"\s]+?\.[a-z0-9]{2,5})['"]''', re.I)
LINK = re.compile(r'''<a\b[^>]*\bhref\s*=\s*["']([^"'#?]+\.html)(?:[#?][^"']*)?["']''', re.I)


def refs_in_html(page, base=None):
    html = strip_comments(read(page))
    base = os.path.dirname(page) if base is None else base
    out = set()
    for r in ATTR.findall(html) + META.findall(html):
        p = local(r, base)
        if p and "." in os.path.basename(p):
            out.add(p)
    for s in SRCSET.findall(html):
        for part in s.split(","):
            p = local(part.strip().split(" ")[0], base)
            if p:
                out.add(p)
    for r in CSSURL.findall(html):             # inline style="" and <style>
        p = local(r, base)
        if p:
            out.add(p)
    return out


# Icon font: every browser in use loads woff2 (woff as a fallback); the eot/ttf/svg copies
# (3.5 MB) are only for IE and very old iOS, so the upload copy drops them.
ICON_CSS = "assets/css/vendor/remixicon.css"
ICON_SRC = re.compile(r"src:\s*url\('\.\./\.\./fonts/remixicon\.eot.*?format\('svg'\);(?:[ \t]*/\*.*?\*/)?", re.S)
ICON_NEW = ('src: url("../../fonts/remixicon.woff2?t=1718271040674") format("woff2"),\n'
            '  url("../../fonts/remixicon.woff?t=1718271040674") format("woff");')


def css_text(css_path):
    css = read(css_path)
    return ICON_SRC.sub(ICON_NEW, css) if css_path == ICON_CSS else css


def refs_in_css(css_path):
    css = re.sub(r"/\*.*?\*/", "", css_text(css_path), flags=re.S)
    base = os.path.dirname(css_path)
    out = set()
    for r in CSSURL.findall(css) + IMPORT.findall(css):
        p = local(r, base)
        if p:
            out.add(p)
    return out


def refs_in_js(js_path):
    out = set()
    for r in JSPATH.findall(read(js_path)):
        out.add(r)
    return out


def live_pages():
    seen, todo = set(), ["index.html"]
    sm = read("sitemap.xml") if os.path.exists(os.path.join(ROOT, "sitemap.xml")) else ""
    for loc in re.findall(r"<loc>(.*?)</loc>", sm):
        p = local(loc)
        if p:
            todo.append(p)
    while todo:
        p = todo.pop()
        if p in seen or not os.path.isfile(os.path.join(ROOT, p)):
            continue
        seen.add(p)
        for r in LINK.findall(strip_comments(read(p))):
            q = local(r, os.path.dirname(p))
            if q and q not in seen:
                todo.append(q)
    return seen


def collect():
    pages = live_pages()
    files = set(pages) | {e for e in EXTRA if os.path.exists(os.path.join(ROOT, e))}
    todo = []
    for p in list(pages) + FRAGMENTS:
        if os.path.exists(os.path.join(ROOT, p)):
            files.add(p)
            # fragments are injected into root pages, so their paths are relative to the root
            todo += [(r, p) for r in refs_in_html(p, "" if p in FRAGMENTS else None)]
    while todo:
        r, by = todo.pop()
        if r.endswith(".html") or r in files:
            continue
        if not os.path.isfile(os.path.join(ROOT, r)):
            missing.setdefault(r, by)
            continue
        files.add(r)
        if r.endswith(".css"):
            todo += [(x, r) for x in refs_in_css(r)]
        elif r.endswith(".js"):
            todo += [(x, r) for x in refs_in_js(r) if not x.endswith(".html")]
    return pages, files


# ---------------------------------------------------------------- optimisation
def optimise_image(dst):
    try:
        from PIL import Image
    except ImportError:
        return 0
    ext = dst.lower().rsplit(".", 1)[-1]
    if ext not in ("jpg", "jpeg", "png", "webp"):
        return 0
    before = os.path.getsize(dst)
    try:
        from PIL import ImageOps
        im = Image.open(dst)
        im.load()
        im = ImageOps.exif_transpose(im)   # keep photos upright once EXIF is dropped
    except Exception:
        return 0
    if getattr(im, "is_animated", False):
        return 0
    w, h = im.size
    if w > MAX_W:
        im = im.resize((MAX_W, round(h * MAX_W / w)), Image.LANCZOS)
    elif before < 150_000:
        return 0                                   # small and not oversized: leave it
    tmp = dst + ".tmp"
    if ext in ("jpg", "jpeg"):
        im.convert("RGB").save(tmp, "JPEG", quality=82, optimize=True, progressive=True)
    elif ext == "webp":
        im.save(tmp, "WEBP", quality=80, method=6)
    else:
        im.save(tmp, "PNG", optimize=True)
    after = os.path.getsize(tmp)
    if after < before:
        os.replace(tmp, dst)
        return before - after
    os.remove(tmp)
    return 0


def minify_css(src):
    """Remove comments and collapse whitespace, leaving strings exactly as written."""
    out, i, n = [], 0, len(src)
    while i < n:
        c = src[i]
        if c in "\"'":                                         # string literal
            j = i + 1
            while j < n and src[j] != c:
                j += 2 if src[j] == "\\" else 1
            out.append(src[i:j + 1]); i = j + 1
        elif src.startswith("/*", i):                          # comment
            j = src.find("*/", i + 2)
            i = n if j < 0 else j + 2
        elif c.isspace():
            j = i
            while j < n and src[j].isspace():
                j += 1
            prev = out[-1][-1] if out and out[-1] else ""
            nxt = src[j] if j < n else ""
            if prev and nxt and prev not in "{};:,>" and nxt not in "{};,>":
                out.append(" ")
            i = j
        else:
            out.append(c); i += 1
    return "".join(out)


# ---------------------------------------------------------------- address (upload copy only)
ADDRESS = "عمارة المتنبي، رقم 1 الدور الأول، الملز، مكتب رقم 12، 2324 شارع عرفات، الرياض 11461، المملكة العربية السعودية"
STREET = "عمارة المتنبي، رقم 1 الدور الأول، الملز، مكتب رقم 12، 2324 شارع عرفات"
PLACE_URL = "https://maps.google.com/?cid=2026902718499016625"           # the company's Google listing
OFFICE_LL = "24.673195,46.7305639"
MAP_EMBED = ("https://www.google.com/maps?q=" + "+".join(ADDRESS.replace("،", "").split())
             + "&amp;ll=" + OFFICE_LL + "&amp;z=16&amp;output=embed&amp;hl=ar")
OLD_ADDR = re.compile(r"عمارة المتنبي رقم 1، الدور الأول، مكتب 12، شارع عرفات(?:، حي الملز)?(?:، الرياض)?")
OLD_MAP = "https://www.google.com/maps?q=24.673195,46.7305639&amp;z=15&amp;output=embed&amp;hl=ar"
OLD_OFFCANVAS = re.compile(r'href="https://www\.google\.com/maps\?q=المملكة\+العربية\+السعودية\+-\+الرياض"([^>]*)>المملكة العربية السعودية - الرياض</a>')
LDJSON = re.compile(r'(<script type="application/ld\+json">)(.*?)(</script>)', re.S)


def fix_address_json(node):
    if isinstance(node, dict):
        if node.get("@type") == "PostalAddress":
            node["streetAddress"] = STREET
            node["addressLocality"] = "الرياض"
            node["postalCode"] = "11461"
            node["addressCountry"] = "SA"
        for v in node.values():
            fix_address_json(v)
    elif isinstance(node, list):
        for v in node:
            fix_address_json(v)


def set_address(path):
    """Put the company address (text, map, structured data) into one upload HTML file."""
    import json
    with io.open(path, encoding="utf-8", newline="") as fh:
        s = fh.read()
    o = s
    s = s.replace(OLD_MAP, MAP_EMBED)
    s = OLD_OFFCANVAS.sub(lambda m: f'href="{PLACE_URL}"{m.group(1)}>{ADDRESS}</a>', s)

    def ld(m):
        try:
            data = json.loads(m.group(2))
        except ValueError:
            return m.group(0)
        fix_address_json(data)
        return m.group(1) + "\n" + json.dumps(data, ensure_ascii=False, indent=2) + "\n" + m.group(3)
    s = LDJSON.sub(ld, s)
    s = OLD_ADDR.sub(ADDRESS, s)          # visible text (footer, contact page); JSON already rewritten
    if s != o:
        with io.open(path, "w", encoding="utf-8", newline="") as fh:
            fh.write(s)
        return 1
    return 0


HTACCESS = """# Compression and browser caching (Apache / LiteSpeed). Ignored by other servers.
<IfModule mod_brotli.c>
  AddOutputFilterByType BROTLI_COMPRESS text/html text/css text/plain text/xml application/javascript application/json image/svg+xml
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml application/javascript application/json image/svg+xml
</IfModule>
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 month"
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType font/woff "access plus 1 year"
  ExpiresByType font/ttf "access plus 1 year"
  ExpiresByType application/pdf "access plus 1 month"
</IfModule>
"""


def main():
    pages, files = collect()
    if os.path.exists(OUT):
        shutil.rmtree(OUT)
    total = 0
    for f in sorted(files):
        dst = os.path.join(OUT, f)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(os.path.join(ROOT, f), dst)
        total += os.path.getsize(dst)

    saved_img = sum(optimise_image(os.path.join(OUT, f)) for f in files)
    saved_css = 0
    for f in files:
        if f.endswith(".css") and not f.endswith(".min.css"):
            dst = os.path.join(OUT, f)
            before = os.path.getsize(dst)
            css = css_text(f)
            with io.open(dst, "w", encoding="utf-8", newline="\n") as fh:
                fh.write(minify_css(css))
            saved_css += before - os.path.getsize(dst)
    with io.open(os.path.join(OUT, ".htaccess"), "w", encoding="utf-8", newline="\n") as fh:
        fh.write(HTACCESS)
    addr = sum(set_address(os.path.join(OUT, f)) for f in files if f.endswith(".html"))

    final = sum(os.path.getsize(os.path.join(d, x)) for d, _, fs in os.walk(OUT) for x in fs)
    mb = lambda b: f"{b / 1048576:.1f} MB"
    print(f"live pages: {len(pages)}   files copied: {len(files)}")
    print(f"copied {mb(total)}  ->  images -{mb(saved_img)}, css -{mb(saved_css)}  =  {mb(final)}")
    print(f"address updated in {addr} html files")
    if missing:
        print("\nreferenced but missing (fix in the source):")
        for r, by in sorted(missing.items()):
            print(f"  {r}   (from {by})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
