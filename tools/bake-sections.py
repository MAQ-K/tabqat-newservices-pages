"""Bake the sections shared by every service page, so they look identical everywhere:

1. Google reviews band - source: components/reviews.html (edit the <li> list there).
2. Closing call to action - one design; each page keeps its own heading, text and WhatsApp
   button. Change those inside the page's <!-- cta:start/end --> block, then re-run.

Run from anywhere:  python tools/bake-sections.py
Styles for both live in assets/css/services.css.
"""
import html
import os
import re
from urllib.parse import quote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

PAGES = """
our-services
waterproofing-thermal-insulation waterproofing-insulation thermal-insulation waterproofing-thermal-insulation-system
epoxy-flooring-coating
structural-strengthening concrete-strengthening soil-injection concrete-repair-injection concrete-honeycomb-repair
shotcrete excavation-shoring
terrazzo-flooring microcement-flooring
""".split()

CSS_LINK = '<link rel="stylesheet" href="assets/css/services.css?v=20261024">'
PHONE = '+966581032502'
WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.4A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2 .2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.4-.3.3c-.1.1-.2.3 0 .5.2.3.8 1.2 1.6 1.9 1 .9 1.9 1.2 2.1 1.3.2.1.4.1.5-.1l.7-.9c.2-.2.3-.2.5-.1l2 .9c.2.1.4.2.4.3.1.1.1.5-.1 1Z"/></svg>'
PHONE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/></svg>'

REVIEWS = re.compile(r'<!-- reviews:start -->.*?<!-- reviews:end -->', re.S)
CTA = re.compile(r'[ \t]*<!-- cta:start -->.*?<!-- cta:end -->\n?', re.S)
OLD_REVIEWS = re.compile(r'[ \t]*<section\b[^>]*\bwp-reviews\b[^>]*>.*?</section>', re.S)
SECONDS_PER_REVIEW = 8

DEFAULT_HEADING = 'جاهز لبدء مشروعك؟'
DEFAULT_LEAD = 'أرسل تفاصيل موقعك وصور المشكلة على واتساب، ويحدد فريق شركة الطبقات المتعددة الحل المناسب وموعد المعاينة.'
DEFAULT_LABEL = 'اطلب معاينة'


def text(fragment):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', fragment))).strip()


# ---------- reviews ----------

def reviews_block():
    block = REVIEWS.search(open('components/reviews.html', encoding='utf8').read()).group(0)
    block = re.sub(r'\n?<!-- Source of.*?-->', '', block, flags=re.S)
    items = re.findall(r'[ \t]*<li class="tq-rev">.*?</li>\n', block, re.S)
    copies = ''.join(i.replace('<li class="tq-rev">', '<li class="tq-rev" aria-hidden="true">', 1) for i in items)
    block = block.replace(items[-1], items[-1] + copies, 1)
    return block.replace('<ul class="tq-reviews__track">',
                         f'<ul class="tq-reviews__track" style="--tq-dur:{len(items) * SECONDS_PER_REVIEW}s">', 1)


def bake_reviews(s, block):
    if REVIEWS.search(s):
        return REVIEWS.sub(lambda _: block, s, count=1)
    if OLD_REVIEWS.search(s):
        return OLD_REVIEWS.sub(lambda _: '    ' + block, s, count=1)
    main = s.index('<main'), s.index('</main>')
    faq = re.search(r'id="wp-faq-heading"|aria-labelledby="[^"]*faq[^"]*"', s[main[0]:main[1]])
    at = None
    if faq:
        at = s.rfind('<section', main[0], main[0] + faq.start())
        at = s.rfind('\n', 0, at) + 1 if at != -1 and 'rs-services-area' not in s[at:s.index('>', at)] else None
    at = at if at is not None else main[1]
    return s[:at] + '    ' + block + '\n\n' + s[at:]


# ---------- call to action ----------

def page_title(s):
    m = re.search(r'<h1[^>]*>(.*?)</h1>', s, re.S) or re.search(r'class="rs-breadcrumb-title">(.*?)</', s, re.S)
    return text(m.group(1)) if m else ''


def take_cta(s):
    """Remove the page's current closing CTA and return (page, fields)."""
    m = CTA.search(s)
    if m:
        b = m.group(0)
        btn = re.search(r'<a class="tq-cta__btn" href="([^"]*)"[^>]*?(?: data-event-label="([^"]*)")?>.*?</svg>\s*(.*?)</a>', b, re.S)
        fields = dict(heading=text(re.search(r'<h2[^>]*>(.*?)</h2>', b, re.S).group(1)),
                      lead=text(re.search(r'<p>(.*?)</p>', b, re.S).group(1)),
                      href=html.unescape(btn.group(1)), event=btn.group(2), label=text(btn.group(3)))
        return s[:m.start()] + s[m.end():], fields

    # insulation hub: its own CTA card inside the content column
    m = re.search(r'[ \t]*<!-- 18\. Final CTA -->\s*<section class="ins-sec">.*?</section>\n?', s, re.S)
    if m:
        b = m.group(0)
        fields = dict(heading=text(re.search(r'ins-cta__title">(.*?)</p>', b, re.S).group(1)),
                      lead=text(re.search(r'ins-cta__text">(.*?)</p>', b, re.S).group(1)))
        return s[:m.start()] + s[m.end():], fields

    # wp-scope pages: the last section in <main>, when it is a call to action
    main_end = s.index('</main>')
    start = s.rfind('<section', 0, main_end)
    if start == -1:
        return s, {}
    end = s.index('</section>', start) + len('</section>')
    sec = s[start:end]
    is_cta = 'wp-scope' in sec[:200] and 'wp-cta-row' in sec and 'wp-faq' not in sec and ('wp-final' in sec[:200] or sec.count('<h2') <= 1)
    if not is_cta:
        return s, {}
    fields = {}
    h2 = re.search(r'<h2[^>]*>(.*?)</h2>', sec, re.S)
    note = re.search(r'<p class="wp-cta-note">(.*?)</p>', sec, re.S)
    lead = re.search(r'<p class="wp-lead">(.*?)</p>', sec, re.S)
    if h2:
        fields['heading'] = text(h2.group(1))
    if note:
        nb = re.search(r'<b>(.*?)</b>', note.group(1), re.S)
        if nb and 'heading' not in fields:
            fields['heading'] = text(nb.group(1))
        rest = re.sub(r'<b>.*?</b>', '', note.group(1), flags=re.S)
        rest = re.sub(r'\s*اتصل:?\s*<a[^>]*>.*?</a>', '', rest, flags=re.S)
        fields['lead'] = text(rest)
    if lead:
        fields['lead'] = text(lead.group(1))
    btn = re.search(r'<a class="wp-cta" href="([^"]*)"([^>]*)>(.*?)</a>', sec, re.S)
    if btn:
        ev = re.search(r'data-event-label="([^"]*)"', btn.group(2))
        fields.update(href=html.unescape(btn.group(1)), event=ev.group(1) if ev else None,
                      label=text(re.sub(r'<svg.*?</svg>', '', btn.group(3), flags=re.S)))
    line_start = s.rfind('\n', 0, start) + 1
    return s[:line_start] + s[end:].lstrip(' \t'), fields


def cta_block(f, title):
    heading = f.get('heading') or DEFAULT_HEADING
    lead = f.get('lead') or DEFAULT_LEAD
    label = f.get('label') or DEFAULT_LABEL
    href = f.get('href') or 'https://wa.me/966581032502?text=' + quote(f'مرحبا، أرغب في الاستفسار عن {title or "خدماتكم"}')
    event = f' data-event-label="{f["event"]}"' if f.get('event') else ''
    e = html.escape
    return f'''<!-- cta:start -->
    <section class="tq-cta" aria-labelledby="tq-cta-heading">
        <div class="container">
            <div class="tq-cta__box">
                <h2 id="tq-cta-heading">{e(heading, False)}</h2>
                <p>{e(lead, False)}</p>
                <div class="tq-cta__actions">
                    <a class="tq-cta__btn" href="{e(href)}" target="_blank" rel="noopener"{event}>{WA_SVG} {e(label, False)}</a>
                    <a class="tq-cta__btn tq-cta__btn--ghost" href="tel:{PHONE}">{PHONE_SVG} اتصل بنا <span dir="ltr">0581032502</span></a>
                </div>
            </div>
        </div>
    </section>
    <!-- cta:end -->'''


# ---------- page ----------

def bake(page, reviews):
    s = open(page, encoding='utf8', newline='').read()
    nl = '\r\n' if '\r\n' in s else '\n'
    s = s.replace('\r\n', '\n')

    s = re.sub(r'[ \t]*<link rel="stylesheet" href="assets/css/reviews\.css[^"]*">\n', '', s)
    if 'assets/css/services.css' not in s:
        at = s.index('</head>')
        s = s[:at] + '        ' + CSS_LINK + '\n' + s[at:]

    s = bake_reviews(s, reviews)
    s, fields = take_cta(s)
    at = s.index('</main>')
    s = s[:at].rstrip() + '\n\n    ' + cta_block(fields, page_title(s)) + '\n' + s[at:]

    assert s.count('id="tq-reviews-heading"') == 1 and s.count('id="tq-cta-heading"') == 1, page
    open(page, 'w', encoding='utf8', newline='').write(s.replace('\n', nl))
    return 'kept page CTA text' if fields.get('heading') else 'default CTA text'


if __name__ == '__main__':
    reviews = reviews_block()
    for name in PAGES:
        print(f'{name}.html: {bake(name + ".html", reviews)}')
