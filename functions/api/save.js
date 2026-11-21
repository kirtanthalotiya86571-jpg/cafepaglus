// Cloudflare Pages Function: POST /api/save
// Adds or updates a cafe in data/cafes.json and uploads its photos in ONE GitHub commit,
// which makes Cloudflare rebuild the site (python build.py) automatically.
// Settings needed (Cloudflare > Pages project > Settings > Variables): GH_TOKEN (secret), GH_REPO ("owner/repo"), GH_BRANCH (optional), ADMIN_EMAILS ("you@x.com,partner@x.com")
// Plus two non-secret values from your Cloudflare Access application, so sign-in is verified here and not just trusted from a header:
//   ACCESS_TEAM_DOMAIN (e.g. "myteam.cloudflareaccess.com") and ACCESS_AUD (the application's "Audience tag").
const clean = v => typeof v === 'string' ? v.replace(/<(?!\/?mark>)/g, '&lt;') : Array.isArray(v) ? v.map(clean) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)])) : v;


// Verifies the signed sign-in token that Cloudflare Access adds to every request it lets through.
// Unlike a plain header, it cannot be faked, so a request that reaches this function by another
// address (a preview link, a per-deployment link) without going through Access is refused.
const b64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), c => c.charCodeAt(0));
async function accessEmail(request, env) {
  const team = (env.ACCESS_TEAM_DOMAIN || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const aud = (env.ACCESS_AUD || '').trim();
  if (!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(team) || !aud) return { error: 'Admin sign-in is not fully set up yet: ACCESS_TEAM_DOMAIN and ACCESS_AUD are missing or wrong.' };
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) return { error: 'Not signed in through Cloudflare Access. Open the admin page from your normal address and sign in.' };
  try {
    const [h, p, sig] = jwt.split('.');
    const head = JSON.parse(new TextDecoder().decode(b64u(h))), claims = JSON.parse(new TextDecoder().decode(b64u(p)));
    if (head.alg !== 'RS256') return { error: 'Sign-in token not accepted.' };
    const certs = await fetch(`https://${team}/cdn-cgi/access/certs`, { cf: { cacheTtl: 3600, cacheEverything: true } }).then(r => r.json());
    const jwk = (certs.keys || []).find(k => k.kid === head.kid);
    if (!jwk) return { error: 'Sign-in token not accepted.' };
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64u(sig), new TextEncoder().encode(h + '.' + p));
    const audOk = [].concat(claims.aud || []).includes(aud);
    if (!ok || !audOk || claims.iss !== `https://${team}` || !(claims.exp > Date.now() / 1000) || !claims.email) return { error: 'Sign-in token not accepted.' };
    return { email: String(claims.email).toLowerCase() };
  } catch (e) { return { error: 'Sign-in token not accepted.' }; }
}

export async function onRequestPost({ request, env }) {
  const a = await accessEmail(request, env);
  if (a.error) return new Response(a.error, { status: 403 });
  const who = a.email;
  const allowed = (env.ADMIN_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  if (!who || !allowed.includes(who)) return new Response('Not allowed. Sign in with an admin email.', { status: 403 });

  let body;
  try { body = await request.json(); } catch (e) { return new Response('Bad request.', { status: 400 }); }
  const { cafe, photos = [] } = body;
  if (!cafe || !/^[a-z0-9-]{2,40}$/.test(cafe.id)) return new Response('Bad page id.', { status: 400 });
  if (photos.length > 15 || photos.some(p => !/^[a-z0-9-]+-\d+$/.test(p.key) || p.b64.length > 4e6)) return new Response('Photos too many or too large.', { status: 400 });

  if (!env.GH_TOKEN || !env.GH_REPO) return new Response('Publishing is not set up yet: GH_TOKEN or GH_REPO is missing in Cloudflare.', { status: 500 });
  const branch = env.GH_BRANCH || 'main';
  const gh = (path, opt = {}) => fetch(`https://api.github.com/repos/${env.GH_REPO}/${path}`, {
    ...opt, headers: { Authorization: `Bearer ${env.GH_TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cafepaglus-admin', 'Content-Type': 'application/json' }
  }).then(async r => { if (!r.ok) throw new Error(`GitHub ${r.status}`); return r.json(); });

  const base = (await gh(`git/ref/heads/${branch}`)).object.sha;
  const baseCommit = await gh(`git/commits/${base}`);
  const file = await gh(`contents/data/cafes.json?ref=${branch}`);
  const data = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\n/g, '')), c => c.charCodeAt(0))));

  const entry = clean(cafe), i = data.cafes.findIndex(c => c.id === entry.id);
  i >= 0 ? data.cafes[i] = entry : data.cafes.push(entry);

  const blob = (content, encoding) => gh('git/blobs', { method: 'POST', body: JSON.stringify({ content, encoding }) }).then(b => b.sha);
  const tree = [{ path: 'data/cafes.json', mode: '100644', type: 'blob', sha: await blob(JSON.stringify(data, null, 1), 'utf-8') }];
  for (const p of photos) tree.push({ path: `photos/${p.key}.webp`, mode: '100644', type: 'blob', sha: await blob(p.b64, 'base64') });

  const t = await gh('git/trees', { method: 'POST', body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree }) });
  const c = await gh('git/commits', { method: 'POST', body: JSON.stringify({ message: `${i >= 0 ? 'Update' : 'Add'} cafe: ${entry.id} (by ${who})`, tree: t.sha, parents: [base] }) });
  await gh(`git/refs/heads/${branch}`, { method: 'PATCH', body: JSON.stringify({ sha: c.sha }) });
  return Response.json({ ok: true });
}
