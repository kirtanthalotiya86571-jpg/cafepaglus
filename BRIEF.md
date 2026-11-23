# cafepaglus: project brief

Read this first. It holds the rules that the page files don't show on their own.

## What the site is
Honest cafe reviews for **Ahmedabad, India**. The team visits every cafe, pays for its own meals, takes no sponsorship, and scores each cafe on five things. The promise: *know before you go.* The site's job is to help someone decide where to go in about 30 seconds.

Audience: mostly phone users in Ahmedabad, often deciding with a group chat (WhatsApp) waiting. **Design mobile first.** Many people care about pure veg and Jain options, and about parking.

## The scoring system (never change it)
Five scores per cafe, each out of 10, in this order: **food, vibe, photos, service, value**.
Overall score `sc` falls into four bands:

| Overall | Band label |
|---|---|
| 8.5+ | go this week |
| 7.5+ | worth a trip |
| 6.5+ | good if you’re nearby |
| below 6.5 | only if you know why |

Each score has a one-line reason (`tk`). Every cafe also has an honest **“maybe not”** (`mn` long, `mns` short) and a best time to go (`bt`). Showing the downside is the brand, so never hide it.

The scoring questions, used wherever a score is explained:
food: *Would we order it again tomorrow?* · vibe: *Would we stay an extra hour?* · photos: *Does it look as good as it tastes?* · service: *Did we feel like guests?* · value: *Does the bill feel fair?*

## Voice
Warm, plain, a little wry, never salesy. Short sentences. Speak like a friend who tells you the truth.
- Say what’s good **and** what’s not. No hype words (“amazing”, “must-visit”).
- Trust lines to reuse: “We pay for our own meals. No sponsored reviews.”
- Headlines are conversational: “Okay, so where are we going?”, “Can’t decide? We’ll pick.”
- Use typographic apostrophes and quotes (’ “ ”). No emojis. Use `·` as a separator. Avoid em dashes.

## Visual system
Fonts: **Inter Tight** (400/500/700/800) for everything, **Caveat** 600 for small handwritten accents (always lime or orange), **Noto Sans Devanagari** as fallback (cafe names can contain Devanagari).
Letter-spacing: `-.02em` body, around `-.05em` on big headings. Headings are heavy (800), large and tight.

Colors (CSS variables, each page defines them; light and dark modes exist):
`--bg #F4F4F4` · `--card #fff` · `--ink #0B0B0B` · `--mut #5f5f5f` · `--line #e3e3e3` · **`--acc #E9F056` (lime)** · `--bad #FF5C34` (orange, for “maybe not”) · `--cas #351E28` (plum) · `--sau #AEB8A0` (sage) · sky `#D7EFFF` · hero dark `#170d12`.
Dark mode: `--bg #130f12`, `--card #1e181c`, `--ink #f4f4f4`, `--mut #a69da2`, `--line #31282d`.
Lime is the signature: scores, primary buttons, active states. On lime or light backgrounds text is always `#0B0B0B`.

Shape and feel: very rounded. Cards 30–36px, hero bottoms 36px, chips 24px, pills 30px, bottom sheets 30px top corners. Touch targets at least 44px. Pages are built from big color blocks (dark hero, then light content, then plum footer block).
Motion: eased, short and purposeful (`cubic-bezier(.2,.8,.2,1)`, 0.4–0.9s). Always honour `prefers-reduced-motion`. Use a small vibration (`navigator.vibrate(6)`) on taps.

Recurring components (copy from the existing pages, don’t reinvent): fixed header that turns blurred after scroll · lime **pill** button · **chips** (toggle buttons, `aria-pressed`) · full-bleed photo **cards** with score badge · score **pills** (`.p5`) · bottom **sheet** with backdrop · **toast** · mobile bottom **dock** · “missing one?” plum end block with the suggest-a-cafe form.

## Technical rules
- Static site: plain HTML, CSS and vanilla JS. No frameworks, no build step for pages. Works when opened from a folder (`file://`) and on any static host.
- Each page links `data/cafes.js` then `site.js` in `<head>`, uses `SITE.nav()` / `SITE.foot()`, and reads cafes from `SITE.cafes` (the picker also uses `SITE.demo`).
- Images: `SITE.IM[key]` full size, `SITE.TH[key]` thumbnail. Source photos go in `photos/`, then `python build.py` makes `img/*.webp`.
- Cafe links: always `SITE.cafeUrl(id)`, which gives `cafe-<id>.html`. Never link to `cafe-detail.html` (it is only the template).
- Saved cafes: `localStorage` key `cp` (an array of ids), shared across pages. The saved button is `[data-sh]`, its counter `#cnt`.
- Accessibility: real buttons and links, `aria-pressed` on toggles, visible focus (`outline` in lime), live regions for result counts, focus handling in sheets, Escape closes them.
- Performance: no heavy inline assets. Keep each page small, and lazy-load extra images.
- Every new page needs: a unique `<title>` and meta description, Open Graph tags (copy the `<!--SEO-->` block from an existing page), a `live` flag switched on in `site.js` (`S.pages`) and a sitemap entry (`build.py` lists `about.html`, `suggest.html`, `privacy.html`, `terms.html` automatically once they exist).
- Data lives only in `data/cafes.json`. Never copy cafe data into a page. After editing it, run `python build.py` (needs `pip install pillow`). Set `DOMAIN` in `build.py` to the real address before launch.

## Data fields (`data/cafes.json`)
`id, n (name), a (area), hr (e.g. “closes 10pm”), cl (closing hour, 24h), tg (short tag), sc, s [5 scores], ph, p [plans: date, group, work, solo, dinner], cr [cravings: coffee, pizza, meal, light], im [photo keys, first is the cover], vd (verdict), hl (headline), rd (review HTML with <mark>), tk [5 lines], mn, mns, bt, ord (what to order), skp (what to skip), si (skip it if…), nt (optional note)`.

## Status
| Page | File | State |
|---|---|---|
| Home | `index.html` | done |
| The list | `list.html` | done |
| Pick for me | `pick.html` | done |
| Cafe detail | `cafe-<id>.html` (from `cafe-detail.html`) | done |
| About / our story | `about.html` | done (team section removed; add real names later if wanted) |
| 404 | `404.html` | done (noindex, not in sitemap) |
| Suggest a cafe | `suggest.html` | done (opens the visitor’s WhatsApp or email with a ready message; needs `SITE.contact` filled in `site.js`). The forms on home, list and story now send people here. |
| Privacy, Terms | `privacy.html`, `terms.html` | done, drafted from what the site actually does. Have them read by the owner, and by a lawyer if possible |
| Admin | `admin.html` + `functions/api/save.js` | done. Private, behind Cloudflare Access. Lists all cafes (and the placeholder ones), adds, edits and deletes. Edit loads everything including photos; the page id is locked. Delete also removes the cafe's page, share image and any photos no other cafe uses |
| Later | saved page, area pages (“best cafes in Bodakdev”), newsletter | after launch |

## Placeholders that need real info
Domain (`build.py`, change with `python set_domain.py https://address`) · contact details (WhatsApp, email, Instagram: fill `S.contact` in `site.js`, the new pages read it) · the team’s names and photos · real visit counts and money spent · opening hours (open-now logic assumes 8am start) · the four **demo cafes** in the picker (remove when real ones exist) · the “maybe not”, “best time” and per-score lines are drafted wording to replace with the team’s own.

Also open: desktop filter sidebar and area / pure-veg / parking filters on the list page; share images are generated and plain.

## How to work on this site
1. Read only the files the task needs. For a new page, start with `BRIEF.md`, `site.js` and one similar page.
2. Match the existing design exactly before improving it. Reuse components.
3. Do not change other pages. If a shared file (`site.js`, `build.py`, `cafes.json`) must change, say exactly what changed.
4. Test in a real browser at phone (390px) and desktop widths: no console errors, no sideways scroll, every button works.
5. Return the new or changed files. Put the full site in a zip only if asked.
6. Never invent facts about real cafes, people or money. Mark anything invented as a placeholder.

## Navigation, transitions and loading screen (all in `site.js`)
- The header is built by `SITE.nav()` on every page that has `<header id="hd">`, so every page matches. It is a dark floating bar (stays readable on light or dark pages), lime marks the current page, and on phones the links move into a full-screen menu. The picker (`pick.html`) and cafe pages keep their own task-specific top bars on purpose.
- Page changes use a short crossfade (cross-document View Transitions, where the browser supports it), links are prefetched when someone is about to tap, and a thin lime line shows while a slow page loads.
- On hosts that serve clean addresses (Cloudflare Pages), links point straight to `/list` instead of `list.html`, which saves a redirect on every click. It switches itself off from a folder, on localhost, or if the host does not clean addresses.
- The loading screen (steaming cup) plays once per visit, on the home page only, never on a shared cafe link, never with reduced motion, and a tap skips it.
- The cafe page back arrow (`data-back`) goes back to where the visitor came from, filters included; with no history it goes to the list.
- The bar's bottom edge sits at 58px, where the sticky filter chips on the list and home pages begin. Keep it there if you change the bar height.

## Things that must stay true so deleting or editing cafes never breaks the site
- No page may assume a particular cafe exists. The home photo strip (`HP` in `index.html`) keeps its captions only while the cafe and photo still exist, then tops up from the remaining cafes.
- `build.py` removes pages, share images and built photos that no longer belong to any cafe, and warns (instead of crashing) when a cafe has no usable hero photo.
- `cafe-detail.html` is the template, never a cafe: the id `detail` is reserved.

