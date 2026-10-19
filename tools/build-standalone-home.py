"""Package the current homepage, styles, scripts and media into one HTML file."""
from pathlib import Path
import base64
import mimetypes
import re
import argparse
from urllib.parse import unquote, urlsplit
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--source', default='index.html')
parser.add_argument('--output', default='design system/homepage-standalone.html')
parser.add_argument('--sections-only', action='store_true')
args = parser.parse_args()
OUT = ROOT / args.output
OUT.parent.mkdir(parents=True, exist_ok=True)
missing = set()
embedded = set()


def asset_url(value, base):
    value = value.strip()
    if not value or value.startswith(('data:', '#', 'http:', 'https:', '//', 'blob:')):
        return value
    path = (base / unquote(urlsplit(value).path)).resolve()
    if not path.is_file():
        missing.add(str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path))
        if path.name.startswith('ui-icons_'):
            # Unused jQuery UI sprite declarations shipped in the template CSS.
            return 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
        # Preserve unavailable source assets as hosted URLs, never broken local paths.
        return 'https://tabqat.com.sa/' + str(path.relative_to(ROOT)).replace('\\', '/') if path.is_relative_to(ROOT) else value
    embedded.add(path)
    mime = mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
    return 'data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode()


def css_urls(css, base):
    # The Arabic homepage uses the embedded Cairo family, not template webfonts.
    css = re.sub(r'@import\s+url\([^;]*fonts\.googleapis\.com[^;]*;', '', css)
    return re.sub(r'url\(\s*([\"\x27]?)(.*?)\1\s*\)',
                  lambda m: 'url("' + asset_url(m[2], base) + '")', css, flags=re.S)


soup = BeautifulSoup((ROOT / args.source).read_text(encoding='utf-8'), 'html.parser')
if args.sections_only:
    # Keep the source head and its style rules, but extract only homepage sections.
    sections = list(soup.select('main section'))
    source_scripts = [script.extract() for script in soup.body.find_all('script')]
    soup.body.clear()
    main = soup.new_tag('main')
    for section in sections:
        main.append(section.extract())
    soup.body.append(main)
    for script in source_scripts:
        soup.body.append(script)
for ident, filename in [('site-offcanvas', 'offcanvas.html'), ('site-footer', 'footer.html')]:
    container = soup.find(id=ident)
    if container is not None and not container.get_text(strip=True):
        fragment = BeautifulSoup((ROOT / 'components' / filename).read_text(encoding='utf-8'), 'html.parser')
        container.clear()
        container.extend(list(fragment.contents))

for link in list(soup.find_all('link')):
    href = link.get('href', '')
    if 'stylesheet' in link.get('rel', []):
        if 'fonts.googleapis.com' in href:
            css = (ROOT / 'design system/assets/cairo-embedded.css').read_text(encoding='utf-8')
        else:
            path = ROOT / urlsplit(href).path
            css = css_urls(path.read_text(encoding='utf-8'), path.parent)
        tag = soup.new_tag('style')
        tag['data-source'] = href
        tag.string = css.replace('</style', '<\\/style')
        link.replace_with(tag)
    elif 'preconnect' in link.get('rel', []):
        link.decompose()
    elif href.startswith('assets/'):
        link['href'] = asset_url(href, ROOT)

for style in soup.find_all('style'):
    if not style.has_attr('data-source'):
        style.string = css_urls(style.get_text(), ROOT)

scripts = []
for script in list(soup.find_all('script', src=True)):
    src = script['src']
    if src.startswith('assets/'):
        if 'components-loader.js' not in src:
            scripts.append((ROOT / urlsplit(src).path).read_text(encoding='utf-8'))
        script.decompose()

# All dependencies execute in source order after parsing, matching deferred scripts.
bundle = soup.new_tag('script')
bundle.string = 'document.addEventListener("DOMContentLoaded", function () {\n' + '\n;\n'.join(scripts).replace('</script', '<\\/script') + '\n});'
soup.body.append(bundle)

for tag in soup.find_all(True):
    for attr in ['src', 'poster', 'data-background', 'data-src']:
        if tag.has_attr(attr) and tag[attr].startswith(('assets/', './assets/')):
            tag[attr] = asset_url(tag[attr], ROOT)
    if tag.has_attr('style'):
        tag['style'] = css_urls(tag['style'], ROOT)
    if tag.has_attr('srcset'):
        parts = []
        for item in tag['srcset'].split(','):
            bits = item.strip().split()
            if bits:
                parts.append(' '.join([asset_url(bits[0], ROOT)] + bits[1:]))
        tag['srcset'] = ', '.join(parts)
    if tag.name == 'a' and tag.get('href'):
        href = tag['href']
        if not href.startswith(('#', 'http:', 'https:', '//', 'tel:', 'mailto:', 'javascript:', 'data:')):
            tag['href'] = 'https://tabqat.com.sa/' + href.lstrip('./')

OUT.write_text(str(soup), encoding='utf-8')
print(f'Created {OUT.name}: {OUT.stat().st_size / 1024 / 1024:.2f} MiB; {len(embedded)} unique embedded assets.')
print('Unavailable source files:', '\n'.join(sorted(missing)) or 'none')
