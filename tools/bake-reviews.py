"""Copy the Google reviews section (components/reviews.html) into every service page.

Run from the repo root after editing the reviews:  python tools/bake-reviews.py
- Re-running replaces the section between the <!-- reviews:start/end --> markers.
- First run replaces an old `wp-reviews` section, or inserts before the FAQ section,
  or before </main> on pages whose FAQ sits inside one big content section.
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

PAGES = """
waterproofing-thermal-insulation waterproofing-insulation thermal-insulation waterproofing-thermal-insulation-system
acrylic-waterproofing-coating bitumen-waterproofing cementitious-waterproofing epdm-waterproofing
polyurea-spray-waterproofing polyurethane-waterproofing pvc-waterproofing perlite-thermal-insulation
polystyrene-board-thermal-insulation polyurethane-board-thermal-insulation rockwool-board-thermal-insulation
epoxy-flooring-coating anti-static-epoxy-flooring epoxy-coating-wastewater-sewage-tanks epoxy-flooring-car-parks-warehouses
epoxy-flooring-cold-storage-freezer-rooms epoxy-flooring-food-processing-facilities epoxy-lining-potable-water-tanks
epoxy-mortar-flooring-systems concrete-repair-injection concrete-honeycomb-repair epoxy-injection-concrete-repair
polyurethane-injection-concrete-leak-stopping concrete-repair-structural-materials structural-strengthening
concrete-strengthening soil-injection shotcrete excavation-shoring terrazzo-flooring microcement-flooring our-services
""".split()

CSS_LINK = '<link rel="stylesheet" href="assets/css/reviews.css?v=20261015">'
MARKED = re.compile(r'<!-- reviews:start -->.*?<!-- reviews:end -->', re.S)
OLD_SECTION = re.compile(r'[ \t]*<section\b[^>]*\bwp-reviews\b[^>]*>.*?</section>', re.S)
SECONDS_PER_CARD = 8


def build_block():
    src = open('components/reviews.html', encoding='utf8').read()
    block = MARKED.search(src).group(0)
    block = re.sub(r'\n?<!-- Source of.*?-->', '', block, flags=re.S)
    items = re.findall(r'[ \t]*<li class="tq-rev">.*?</li>\n', block, re.S)
    copies = ''.join(i.replace('<li class="tq-rev">', '<li class="tq-rev" aria-hidden="true">', 1) for i in items)
    block = block.replace(items[-1], items[-1] + copies, 1)
    return block.replace('<ul class="tq-reviews__track">',
                         f'<ul class="tq-reviews__track" style="--tq-dur:{len(items) * SECONDS_PER_CARD}s">', 1)


def bake(page, block):
    s = open(page, encoding='utf8', newline='').read()
    nl = '\r\n' if '\r\n' in s else '\n'
    s = s.replace('\r\n', '\n')

    if 'assets/css/reviews.css' not in s:
        main_css = re.search(r'[ \t]*<link rel="stylesheet" href="assets/css/main\.css[^"]*">\n', s)
        at = main_css.end() if main_css else s.index('</head>')
        s = s[:at] + '        ' + CSS_LINK + '\n' + s[at:]

    if MARKED.search(s):
        s = MARKED.sub(lambda _: block, s, count=1)
        how = 'updated'
    elif OLD_SECTION.search(s):
        s = OLD_SECTION.sub(lambda _: '    ' + block, s, count=1)
        how = 'replaced old section'
    else:
        main = s.index('<main'), s.index('</main>')
        faq = re.search(r'id="wp-faq-heading"|aria-labelledby="[^"]*faq[^"]*"', s[main[0]:main[1]])
        at = None
        if faq:
            at = s.rfind('<section', main[0], main[0] + faq.start())
            at = s.rfind('\n', 0, at) + 1 if at != -1 and 'rs-services-area' not in s[at:s.index('>', at)] else None
        how = 'inserted before FAQ' if at else 'inserted before </main>'
        if at is None:
            at = main[1]
        s = s[:at] + '    ' + block + '\n\n' + s[at:]

    assert s.count('id="tq-reviews-heading"') == 1, page
    open(page, 'w', encoding='utf8', newline='').write(s.replace('\n', nl))
    return how


if __name__ == '__main__':
    block = build_block()
    for name in PAGES:
        print(f'{name}.html: {bake(name + ".html", block)}')
