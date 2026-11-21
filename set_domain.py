#!/usr/bin/env python3
"""Switch the site address everywhere in one go.
Usage:  python set_domain.py https://your-address.pages.dev
Changes DOMAIN in build.py and the canonical / Open Graph tags in every .html page, then rebuilds.
Run it again later when you move to your own domain (e.g. https://www.cafepaglus.com)."""
import glob, os, re, sys
R = os.path.dirname(os.path.abspath(__file__))
if len(sys.argv) != 2 or not re.fullmatch(r'https://[a-z0-9.-]+', sys.argv[1].rstrip('/').lower()):
    sys.exit('Usage: python set_domain.py https://your-address.pages.dev   (https, no path, no trailing slash)')
new = sys.argv[1].rstrip('/').lower()
b = open(os.path.join(R, 'build.py'), encoding='utf-8').read()
m = re.search(r"^DOMAIN = '(https://[^']+)'", b, re.M)
if not m: sys.exit('Could not find DOMAIN in build.py')
old = m.group(1)
if old == new: print('Already set to', new)
else:
    n = 0
    for f in ['build.py'] + [os.path.basename(x) for x in glob.glob(os.path.join(R, '*.html'))]:
        p = os.path.join(R, f); s = open(p, encoding='utf-8').read()
        if old in s:
            n += s.count(old); open(p, 'w', encoding='utf-8').write(s.replace(old, new))
    print(f'Changed {old} -> {new} ({n} places)')
import importlib.util
spec = importlib.util.spec_from_file_location('build', os.path.join(R, 'build.py')); mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); mod.build()
