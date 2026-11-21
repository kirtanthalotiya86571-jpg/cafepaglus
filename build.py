#!/usr/bin/env python3
"""cafepaglus build. Run `python build.py` after editing data/cafes.json or adding files to photos/.
Needs: pip install pillow. Produces: img/*.webp, data/cafes.js, cafe-<id>.html, og images, sitemap.xml, robots.txt, manifest, icons."""
import json, os, re, glob, html
from PIL import Image, ImageDraw, ImageFont

R = os.path.dirname(os.path.abspath(__file__)); P = lambda *a: os.path.join(R, *a)
DOMAIN = 'https://www.cafepaglus.com'   # TODO: set your real domain, then rebuild
esc = lambda s: html.escape(s, quote=True)
nm = lambda c: c['n'].split('|')[0].strip()
band = lambda s: 'go this week' if s >= 8.5 else 'worth a trip' if s >= 7.5 else 'good if you’re nearby' if s >= 6.5 else 'only if you know why'

GUARD = '<script>addEventListener(\'DOMContentLoaded\',function(){if(window.SITE)return;var d=document.createElement(\'div\');d.style.cssText=\'position:fixed;inset:0;z-index:999;background:#351E28;color:#fff;display:grid;place-items:center;padding:28px;text-align:center;font:500 18px/1.5 system-ui,sans-serif\';d.innerHTML=\'<div><b style="font-size:26px">Some site files are missing.</b><br><br>Keep the whole folder together. <code>site.js</code>, <code>data/</code> and <code>img/</code> must sit next to this page.</div>\';document.body.appendChild(d)})</script>'

def head(title, desc, path, img='img/og.jpg', extra='', tc=True):
    u = f'{DOMAIN}/{path}'
    return (f'<title>{esc(title)}</title><meta name="description" content="{esc(desc)}"><link rel="canonical" href="{u}">'
            f'<meta property="og:type" content="website"><meta property="og:site_name" content="cafepaglus"><meta property="og:locale" content="en_IN">'
            f'<meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}"><meta property="og:url" content="{u}">'
            f'<meta property="og:image" content="{DOMAIN}/{img}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
            f'<meta name="twitter:card" content="summary_large_image">' + ('<meta name="theme-color" content="#351E28">' if tc else '') +
            '<link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="icon-192.png"><link rel="manifest" href="manifest.webmanifest">'
            + extra + '<script src="data/cafes.js"></script><script src="site.js"></script>' + GUARD)

def font(sz):
    for f in (P('fonts', 'Inter-ExtraBold.otf'), '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', 'C:/Windows/Fonts/arialbd.ttf', '/Library/Fonts/Arial Bold.ttf'):
        if os.path.exists(f): return ImageFont.truetype(f, sz)
    return ImageFont.load_default()

def photos():
    os.makedirs(P('img'), exist_ok=True)
    for f in glob.glob(P('photos', '*')):
        k = os.path.splitext(os.path.basename(f))[0]; im = Image.open(f).convert('RGB')
        for suf, w, q in (('', 1400, 78), ('-sm', 520, 74)):
            t = im.copy(); t.thumbnail((w, w)); t.save(P('img', k + suf + '.webp'), 'WEBP', quality=q, method=6)

def og(out, photo, l1, l2='', score=None):
    W, H = 1200, 630; im = Image.open(P('img', photo + '.webp')).convert('RGB')
    r = max(W / im.width, H / im.height); im = im.resize((int(im.width * r) + 1, int(im.height * r) + 1))
    l, t = (im.width - W) // 2, (im.height - H) // 2; im = im.crop((l, t, l + W, t + H)).convert('RGBA')
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    for y in range(H): d.line([(0, y), (W, y)], fill=(15, 8, 12, int(235 * max(0, (y - H * .25) / (H * .75)) ** 1.2)))
    im = Image.alpha_composite(im, g); d = ImageDraw.Draw(im); s = 84
    while font(s).getlength(l1) > 1090 and s > 40: s -= 4
    d.text((56, 48), 'cafepaglus', font=font(40), fill=(233, 240, 86)); d.text((56, H - 200), l1, font=font(s), fill='white'); d.text((56, H - 84), l2, font=font(34), fill=(255, 255, 255, 215))
    if score is not None:
        d.rounded_rectangle((W - 300, 40, W - 50, 190), 36, fill=(233, 240, 86)); d.text((W - 175, 117), f'{score:.1f}', font=font(100), fill=(11, 11, 11), anchor='mm')
    im.convert('RGB').save(P('img', out), 'JPEG', quality=84)

def icons():
    open(P('favicon.svg'), 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#E9F056"/><text x="32" y="47" font-size="42" font-weight="800" text-anchor="middle" fill="#351E28" font-family="Inter Tight,Arial,sans-serif">c</text></svg>')
    for n in (192, 512):
        im = Image.new('RGB', (n, n), (233, 240, 86)); d = ImageDraw.Draw(im); d.text((n / 2, n * .52), 'c', font=font(int(n * .62)), fill=(53, 30, 40), anchor='mm'); im.save(P(f'icon-{n}.png'))
    json.dump({'name': 'cafepaglus', 'short_name': 'cafepaglus', 'description': 'Honest cafe scores for Ahmedabad', 'start_url': 'index.html', 'display': 'standalone', 'background_color': '#351E28', 'theme_color': '#351E28',
               'icons': [{'src': f'icon-{n}.png', 'sizes': f'{n}x{n}', 'type': 'image/png'} for n in (192, 512)]}, open(P('manifest.webmanifest'), 'w'), indent=1)

def build():
    photos(); icons(); D = json.load(open(P('data', 'cafes.json'), encoding='utf-8'))
    open(P('data', 'cafes.js'), 'w', encoding='utf-8').write('window.CAFES=' + json.dumps(D, ensure_ascii=False) + ';')
    og('og.jpg', 'kfire', 'Is that cafe actually good?', 'Honest cafe scores for Ahmedabad')
    tpl = open(P('cafe-detail.html'), encoding='utf-8').read(); urls = ['index.html', 'list.html', 'pick.html']
    for c in D['cafes']:
        og(f'og-{c["id"]}.jpg', c['im'][0], nm(c), f'{c["a"]} · {band(c["sc"])}', c['sc'])
        ld = json.dumps({'@context': 'https://schema.org', '@type': 'CafeOrCoffeeShop', 'name': nm(c), 'telephone': '+91' + c['ph'].lstrip('0'),
                         'address': {'@type': 'PostalAddress', 'streetAddress': c['a'], 'addressLocality': 'Ahmedabad', 'addressRegion': 'Gujarat', 'addressCountry': 'IN'}}, ensure_ascii=False)
        h = head(f'{nm(c)} review: {c["sc"]:.1f}/10, {band(c["sc"])} | cafepaglus', c['hl'], f'cafe-{c["id"]}.html', f'img/og-{c["id"]}.jpg',
                 f'<script>window.CAFE_ID="{c["id"]}"</script><script type="application/ld+json">{ld}</script>')
        out = re.sub(r'<!--SEO-->.*?<!--/SEO-->', lambda m: '<!--SEO-->' + h + '<!--/SEO-->', tpl, 1, flags=re.S)
        open(P(f'cafe-{c["id"]}.html'), 'w', encoding='utf-8').write(out); urls.append(f'cafe-{c["id"]}.html')
    for extra in ('about.html', 'suggest.html', 'privacy.html', 'terms.html'):
        if os.path.exists(P(extra)): urls.append(extra)
    open(P('sitemap.xml'), 'w').write('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + ''.join(f'<url><loc>{DOMAIN}/{u}</loc></url>' for u in urls) + '</urlset>')
    open(P('robots.txt'), 'w').write(f'User-agent: *\nAllow: /\nDisallow: /cafe-detail.html\nSitemap: {DOMAIN}/sitemap.xml\n')
    print('built', len(D['cafes']), 'cafe pages,', len(glob.glob(P('img', '*.webp'))), 'images')

if __name__ == '__main__': build()
