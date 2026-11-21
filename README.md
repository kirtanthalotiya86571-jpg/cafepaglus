# cafepaglus site

**Keep this folder together.** Download or copy the whole `site/` folder (or the zip). The pages need `site.js`, `data/` and `img/` beside them, and show a "files are missing" notice if those are absent.

Open `index.html` in a browser. It works from a folder (no server needed) and on any static host.

## Add or edit a cafe
1. Drop photos into `photos/` (jpg, png or webp). The file name is the photo key, e.g. `bodakdev-latte.jpg`.
2. Add the cafe to `data/cafes.json` (copy an existing entry). `im` lists photo keys, the first is the cover.
3. Run `pip install pillow` once, then `python build.py`.

That regenerates optimised images, `data/cafes.js`, every `cafe-<id>.html` page, share images (`img/og-<id>.jpg`), `sitemap.xml` and `robots.txt`.

## Before launch
- Set `DOMAIN` at the top of `build.py` to your real address, then rebuild. The hand-written pages (`index.html`, `list.html`, `pick.html`, `about.html`, `404.html`, `cafe-detail.html`) also contain `https://www.cafepaglus.com` in their canonical and Open Graph tags. Find and replace it with your real address in those files.
- `404.html` is the not-found page. Most static hosts (Netlify, Cloudflare Pages, Vercel, GitHub Pages) serve it automatically for unknown addresses. On a deep wrong address like `/foo/bar` its relative links break, so once the site lives at the root of your domain, add `<base href="/">` as the first tag inside its `<head>`. Do not add it to the other pages, or they stop working when opened from a folder.
- The “suggest a cafe” forms on the home and story pages only show a message. Nothing is sent anywhere until `suggest.html` is built and connected to your WhatsApp or email.
- Replace the placeholders listed in `BRIEF.md` (contact details, visit counts, opening hours, the demo cafes, drafted “maybe not” lines).
- `cafe-detail.html` is only the template for cafe pages. Do not link to it.
- Cafes under `"demo"` in `cafes.json` only appear in the picker. Remove them when you have real ones.
- Pages you add later: flip their `live` flag in `site.js` (`S.pages`) and they appear in the header and footer. `about.html` is already live and shows in the footer. `404.html` is not a nav page, so it has no flag and is not in the sitemap.

## Admin page and publishing (Cloudflare)
- `admin.html` lets the owners add or update a cafe without touching code. It sends the cafe to `functions/api/save.js`, which makes one GitHub commit. Cloudflare then rebuilds the site (`pip install pillow && python build.py`). It cannot delete a cafe: to remove one, delete its entry in `data/cafes.json` and its `photos/<id>-*.webp` files on GitHub.
- `save.js` only accepts people signed in through Cloudflare Access. It checks Cloudflare’s signed sign-in token itself, so it needs these settings in Cloudflare (Pages project > Settings > Variables and Secrets): `GH_TOKEN` (secret), `GH_REPO` (`owner/cafepaglus`), `GH_BRANCH` (optional, default `main`), `ADMIN_EMAILS` (comma separated), `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` (from the Access application).
- Share images use `fonts/Inter-ExtraBold.otf` (SIL Open Font License, see `fonts/LICENSE-Inter.txt`), so they look the same on any build machine.
- Change the site address everywhere with `python set_domain.py https://your-address`.
- Contact details live in one place: `S.contact` in `site.js`.

