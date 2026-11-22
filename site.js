/* cafepaglus shared runtime. Loaded after data/cafes.js on every page. */
(function(){
const S=window.SITE={},D=window.CAFES||{cafes:[],demo:[]},f=(location.pathname.split('/').pop()||'index').replace(/\.html$/,'')+'.html';  /* Cloudflare serves /about for about.html, so compare without the extension */
S.cafes=D.cafes;S.demo=D.demo;
S.IM=new Proxy({},{get:(_,k)=>typeof k=='string'?`img/${k}.webp`:void 0});   /* full size */
S.TH=new Proxy({},{get:(_,k)=>typeof k=='string'?`img/${k}-sm.webp`:void 0}); /* thumbnail */
S.abs=p=>new URL(p,location.href).href;
/* Contact details. Fill these in once; suggest.html, privacy.html and terms.html read them from here.
   whatsapp: digits only with country code, e.g. 919876543210 (no + or spaces). email: full address. instagram: handle without @. Leave '' to hide. */
S.contact={whatsapp:'',email:'',instagram:''};
S.contactHtml=()=>{const c=S.contact,o=[];if(c.whatsapp)o.push(`<a href="https://wa.me/${c.whatsapp}" rel="noopener">WhatsApp</a>`);if(c.email)o.push(`<a href="mailto:${c.email}">${c.email}</a>`);if(c.instagram)o.push(`<a href="https://www.instagram.com/${c.instagram}" rel="noopener">Instagram @${c.instagram}</a>`);return o.join(' · ')};
/* flip live to 1 when a page ships. Header shows the first four, footer shows every live page. */
S.pages=[['list.html','the list',1],['pick.html','pick for me',1],['index.html#how','how we score',1],['about.html','our story',1],['index.html#trust','why trust us',1],['suggest.html','suggest a cafe',1],['privacy.html','privacy',1],['terms.html','terms',1]];
/* ---- Clean addresses. Cloudflare Pages (and most hosts) serve /list for list.html and redirect the .html form,
   so linking straight to /list saves a round trip on every click. Not used from a folder, on localhost,
   or when this page itself was opened as .html (that host does not clean addresses). ---- */
S.clean=location.protocol!='file:'&&!/^(localhost|127\.|\[::1\])/.test(location.hostname)&&!/\.html$/.test(location.pathname);
S.u=p=>S.clean?p.replace(/^index\.html(?=$|[#?])/,'./').replace(/\.html(?=$|[#?])/,''):p;
S.cafeUrl=id=>S.u(`cafe-${id}.html`);
const vib=()=>navigator.vibrate&&navigator.vibrate(6);

/* ---- Styles for the nav, menu, page transitions, progress line and loading screen ---- */
const css=`
a,button,label{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
[data-foot] a{text-decoration:underline;text-underline-offset:3px;margin-right:14px;display:inline-block;padding:6px 0}[data-foot] p{margin-top:6px}
@media(prefers-reduced-motion:no-preference){@view-transition{navigation:auto}}
.cpn{view-transition-name:cpn}
::view-transition-old(root){animation:cpn-out .14s ease both}
::view-transition-new(root){animation:cpn-in .3s cubic-bezier(.2,.8,.2,1) both}
@keyframes cpn-out{to{opacity:0}}@keyframes cpn-in{from{opacity:0;transform:translateY(10px)}}
.cpn{position:fixed;z-index:50;left:0;right:0;top:max(6px,env(safe-area-inset-top,0px));pointer-events:none}
.cpn-bar{pointer-events:auto;display:flex;align-items:center;gap:6px;height:52px;width:min(1084px,calc(100% - 16px));margin:0 auto;padding:0 4px 0 6px;border-radius:30px;background:rgba(23,13,18,.84);color:#fff;border:1px solid #ffffff1f;box-shadow:0 10px 32px #0000002e;-webkit-backdrop-filter:blur(18px) saturate(1.4);backdrop-filter:blur(18px) saturate(1.4)}
.cpn a,.cpn button{color:inherit;text-decoration:none;font:inherit;letter-spacing:-.02em;cursor:pointer}
.cpn .cpn-logo{display:flex;align-items:center;gap:9px;height:44px;padding:0 12px 0 0;border-radius:22px;font-size:21px;font-weight:800;letter-spacing:-.05em;transition:transform .15s}
.cpn-mk{display:grid;place-items:center;width:38px;height:38px;border-radius:13px;background:#E9F056;color:#351E28;font-size:25px;line-height:1;padding-bottom:4px}
.cpn-links{display:flex;gap:2px;margin-left:auto;font-size:14px;font-weight:500}
.cpn-links a{display:flex;align-items:center;height:44px;padding:0 16px;border-radius:22px;transition:background .2s,transform .15s}
.cpn-links a:hover{background:#ffffff1f}
.cpn-links a[aria-current]{background:#E9F056;color:#0B0B0B;font-weight:700}
.cpn .cpn-sv{height:44px;padding:0 16px;border:0;border-radius:22px;background:#ffffff1f;font-size:14px;font-weight:500;margin-left:4px;transition:transform .15s,background .2s}
.cpn .cpn-sv:hover{background:#ffffff33}.cpn-sv b{font-weight:700}.cpn .cpn-sv[hidden]{display:none}
.cpn-mb{display:none;place-items:center;width:44px;height:44px;border:0;border-radius:50%;background:#ffffff1f;transition:transform .15s}
.cpn-mb span{grid-area:1/1;width:18px;height:2px;border-radius:2px;background:currentColor;transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.cpn-mb span:first-child{transform:translateY(-3.5px)}.cpn-mb span:last-child{transform:translateY(3.5px)}
.cpn-mb.x span:first-child{transform:rotate(45deg)}.cpn-mb.x span:last-child{transform:rotate(-45deg)}
.cpn-links a:active,.cpn-sv:active,.cpn-mb:active,.cpn .cpn-logo:active{transform:scale(.95)}
.cpn a:focus-visible,.cpn button:focus-visible,.cpn-menu a:focus-visible,.cpn-skip:focus-visible{outline:2px solid #E9F056;outline-offset:3px}
.cpn-skip{position:fixed;left:12px;top:-70px;z-index:2147483002;background:#E9F056;color:#0B0B0B;padding:12px 18px;border-radius:20px;font-weight:700;text-decoration:none;transition:top .2s}.cpn-skip:focus{top:max(8px,env(safe-area-inset-top,0px))}
.cpn-menu{position:fixed;z-index:49;left:0;right:0;top:0;max-height:100svh;overflow:auto;padding:calc(76px + env(safe-area-inset-top,0px)) 22px 26px;background:#351E28;color:#fff;border-radius:0 0 36px 36px;transform:translateY(-104%);visibility:hidden;transition:transform .55s cubic-bezier(.2,.8,.2,1),visibility 0s .55s}
.cpn-menu.open{transform:none;visibility:visible;transition:transform .55s cubic-bezier(.2,.8,.2,1),visibility 0s}
.cpn-bk{position:fixed;inset:0;z-index:48;background:#000;opacity:0;visibility:hidden;transition:opacity .4s,visibility 0s .4s}.cpn-bk.open{opacity:.55;visibility:visible;transition:opacity .4s,visibility 0s}
.cpn-big{display:grid;margin:0;padding:0;list-style:none}
.cpn-big a{display:flex;justify-content:space-between;align-items:center;min-height:60px;padding:6px 4px;font-size:clamp(34px,10.5vw,52px);font-weight:800;letter-spacing:-.05em;line-height:1;color:#fff;text-decoration:none;border-bottom:1px solid #ffffff1f;opacity:0;transform:translateY(14px);transition:opacity .4s,transform .5s cubic-bezier(.2,.8,.2,1)}
.cpn-menu.open .cpn-big a{opacity:1;transform:none;transition-delay:calc(.12s + var(--i)*50ms)}
.cpn-big a[aria-current]{color:#E9F056}.cpn-big a::after{content:'→';font-size:.5em;font-weight:500;opacity:.55}
.cpn-sm{display:flex;flex-wrap:wrap;gap:0 20px;margin-top:20px;font-size:15px}.cpn-sm a{padding:12px 0;color:#ffffffb8;text-decoration:underline;text-underline-offset:3px}
.cpn-tag{font-family:'Caveat',cursive;font-weight:600;font-size:34px;color:#E9F056;margin-top:10px;line-height:1}
html.cpn-lock{overflow:hidden}html.cpn-lock #dock{opacity:0;pointer-events:none}
@media(max-width:760px){.cpn-links{display:none}.cpn-mb{display:grid}.cpn .cpn-logo{margin-right:auto}}
.cpn-ld{position:fixed;z-index:2147483001;top:0;left:0;height:3px;width:100%;background:#E9F056;transform-origin:0 50%;transform:scaleX(0);pointer-events:none}
html.cp-ld,html.cp-ld body{overflow:hidden}
html.cp-ld *,html.cp-ld *::before,html.cp-ld *::after{animation-play-state:paused!important}
html.cp-ld .cpl,html.cp-ld .cpl *,html.cp-ld .cpl *::before,html.cp-ld .cpl *::after{animation-play-state:running!important}
.cpl{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;background:#351E28;color:#fff;overflow:hidden;transition:transform .8s cubic-bezier(.76,0,.24,1),border-radius .8s;will-change:transform}
.cpl.out{transform:translateY(-100%);border-radius:0 0 36px 36px}
.cpl-in{display:grid;justify-items:center;gap:12px;padding:0 18px;transition:opacity .3s}.cpl.out .cpl-in{opacity:0}
.cpl-cup{width:clamp(96px,26vw,132px);height:auto;overflow:visible;animation:cpl-bob 2.4s ease-in-out infinite}
.cpl-fill{animation:cpl-fill 1.1s cubic-bezier(.5,0,.2,1) .15s both}
.cpl-st{stroke-dasharray:26;stroke-dashoffset:26;opacity:0;animation:cpl-st 1.6s ease-in-out infinite}.cpl-st.s2{animation-delay:.3s}.cpl-st.s3{animation-delay:.6s}
.cpl-wm{display:flex;font:800 clamp(42px,13.5vw,96px)/1 'Inter Tight','Noto Sans Devanagari',system-ui,sans-serif;letter-spacing:-.05em;overflow:hidden;padding:.06em .02em .12em}
.cpl-wm span{display:inline-block;transform:translateY(115%);animation:cpl-up .7s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:calc(.3s + var(--i)*45ms)}
.cpl-sc{font:600 clamp(26px,6vw,36px)/1 'Caveat',cursive;color:#E9F056;opacity:0;animation:cpl-fade .6s ease .95s forwards}
.cpl-pg{position:absolute;left:0;bottom:0;height:4px;width:100%;background:#E9F056;transform:scaleX(0);transform-origin:0 50%;animation:cpl-pg 1.2s cubic-bezier(.6,.1,.2,1) forwards}
@keyframes cpl-bob{50%{transform:translateY(-5px)}}@keyframes cpl-fill{from{transform:translateY(62px)}to{transform:none}}
@keyframes cpl-st{0%{stroke-dashoffset:26;opacity:0}30%{opacity:.9}100%{stroke-dashoffset:-26;opacity:0}}
@keyframes cpl-up{to{transform:none}}@keyframes cpl-fade{to{opacity:1}}@keyframes cpl-pg{to{transform:scaleX(1)}}
@media(prefers-reduced-motion:reduce){.cpn *,.cpn-menu,.cpn-menu *,.cpn-bk{transition:none!important}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* ---- Nav: one header for every page, built here so all pages match. ---- */
const live=()=>S.pages.filter(p=>p[2]),big=['list.html','pick.html','index.html#how','about.html','suggest.html'];
const link=(p,i)=>`<a href="${S.u(p[0])}"${p[0]==f?' aria-current="page"':''}${i!=null?` style="--i:${i}"`:''}>${p[1]}</a>`;
S.nav=()=>{const h=document.getElementById('hd');if(!h)return;
const L=live(),root=document.documentElement,bar=document.createElement('div');bar.id='hd';bar.className='cpn';
bar.innerHTML=`<div class="cpn-bar"><a class="cpn-logo" href="${S.u('index.html')}" aria-label="cafepaglus, home"><span class="cpn-mk" aria-hidden="true">c</span>cafepaglus</a><nav class="cpn-links" aria-label="main">${L.slice(0,4).map(p=>link(p)).join('')}</nav><button type="button" class="cpn-sv" data-sh aria-label="saved cafes">saved ♡ <b id="cnt"></b></button><button type="button" class="cpn-mb" aria-label="menu" aria-expanded="false" aria-controls="cpn-menu"><span></span><span></span></button></div>`;
h.replaceWith(bar);
const menu=document.createElement('div'),bk=document.createElement('div'),skip=document.createElement('a');
menu.id='cpn-menu';menu.className='cpn-menu';menu.setAttribute('role','dialog');menu.setAttribute('aria-modal','true');menu.setAttribute('aria-label','menu');
menu.innerHTML=`<ul class="cpn-big">${L.filter(p=>big.includes(p[0])).map((p,i)=>`<li>${link(p,i)}</li>`).join('')}</ul><div class="cpn-sm">${L.filter(p=>!big.includes(p[0])).map(p=>link(p)).join('')}</div><div class="cpn-tag">know before you go</div>`;
bk.className='cpn-bk';skip.className='cpn-skip';skip.href='#main';skip.textContent='skip to content';
bar.before(skip);document.body.append(menu,bk);
const mb=bar.querySelector('.cpn-mb'),open=()=>menu.classList.contains('open');
const setM=o=>{menu.classList.toggle('open',o);bk.classList.toggle('open',o);mb.classList.toggle('x',o);mb.setAttribute('aria-expanded',o);mb.setAttribute('aria-label',o?'close menu':'menu');root.classList.toggle('cpn-lock',o);
if(o)(menu.querySelector('a')||mb).focus({preventScroll:true});else if(menu.contains(document.activeElement))mb.focus({preventScroll:true})};
mb.onclick=()=>{vib();setM(!open())};bk.onclick=()=>setM(false);
menu.addEventListener('click',e=>{if(e.target.closest('a'))setM(false)});
bar.querySelector('.cpn-sv').addEventListener('click',()=>{if(open())setM(false)});
addEventListener('keydown',e=>{if(!open())return;if(e.key=='Escape')return setM(false);
if(e.key!='Tab')return;const t=[mb,...menu.querySelectorAll('a')],i=t.indexOf(document.activeElement);
if(e.shiftKey&&i<=0){e.preventDefault();t[t.length-1].focus()}else if(!e.shiftKey&&(i<0||i==t.length-1)){e.preventDefault();t[0].focus()}});
addEventListener('resize',()=>{if(innerWidth>760&&open())setM(false)});
addEventListener('pageshow',()=>{if(open())setM(false)});
addEventListener('DOMContentLoaded',()=>{if(!document.getElementById('shd'))bar.querySelector('.cpn-sv').hidden=true;const m=document.querySelector('main');if(m&&!m.id)m.id='main'});
bar.addEventListener('click',e=>{if(e.target.closest('a'))vib()})};
S.foot=()=>document.querySelectorAll('[data-foot]').forEach(e=>{e.innerHTML=`<div>${live().filter(p=>p[0]!=f).map(p=>`<a href="${S.u(p[0])}">${p[1]}</a>`).join('')}</div><p>demo build · scores, verdicts and some details are placeholders until we finish our visits.</p>`});

/* ---- Faster, smoother clicks: clean links, prefetch on touch or hover, progress line, back arrow ---- */
const fix=a=>{if(!S.clean||!a||a.dataset.cu)return;const h=a.getAttribute('href');if(h&&/^(?![a-z][a-z0-9+.-]*:|\/\/|#).*\.html(?=$|[#?])/i.test(h))a.setAttribute('href',S.u(h));a.dataset.cu=1};
const spec=window.HTMLScriptElement&&HTMLScriptElement.supports&&HTMLScriptElement.supports('speculationrules');
if(spec){const s=document.createElement('script');s.type='speculationrules';s.textContent=JSON.stringify({prefetch:[{where:{and:[{href_matches:'/*'},{not:{href_matches:['/admin*','/api/*','/img/*','/photos/*','/data/*','/functions/*']}}]},eagerness:'moderate'}]});document.head.appendChild(s)}
const pf=new Set(),pre=a=>{if(!a||!a.href||pf.has(a.href))return;const u=new URL(a.href,location.href);if(u.origin!=location.origin||u.pathname==location.pathname||/^\/(admin|api|img|photos|data)/.test(u.pathname)||/\.(json|js|jpe?g|png|webp|svg)$/.test(u.pathname))return;pf.add(a.href);const l=document.createElement('link');l.rel='prefetch';l.href=a.href;document.head.appendChild(l)};
['pointerdown','mouseover','focusin','touchstart'].forEach(t=>document.addEventListener(t,e=>{const a=e.target.closest&&e.target.closest('a[href]');fix(a);if(!spec)pre(a)},{capture:true,passive:true}));
let pb;const prog=()=>{pb=pb||Object.assign(document.createElement('i'),{className:'cpn-ld'});if(!pb.isConnected)document.body.appendChild(pb);pb.style.transition='none';pb.style.transform='scaleX(.06)';pb.getBoundingClientRect();pb.style.transition='transform 6s cubic-bezier(.1,.6,.2,1)';pb.style.transform='scaleX(.88)'};
addEventListener('pageshow',()=>{if(pb)pb.remove()});
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href]');if(!a)return;fix(a);
if(a.matches('[data-back]')&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.button){try{const r=new URL(document.referrer);if(history.length>1&&r.origin==location.origin&&r.pathname!=location.pathname){e.preventDefault();history.back();return}}catch(x){}}
if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button||(a.target&&a.target!='_self')||a.hasAttribute('download'))return;
const u=new URL(a.href,location.href);if(u.origin!=location.origin||(u.pathname==location.pathname&&u.search==location.search))return;
setTimeout(()=>{if(!e.defaultPrevented)prog()},0)},true);

/* ---- Loading screen: home page, once per visit. Skipped for reduced motion. Tap to skip. ---- */
(function(){try{if(f!='index.html'||matchMedia('(prefers-reduced-motion:reduce)').matches||sessionStorage.getItem('cpl'))return;sessionStorage.setItem('cpl','1')}catch(e){return}
const r=document.documentElement,el=document.createElement('div');el.className='cpl';el.setAttribute('aria-hidden','true');
el.innerHTML=`<div class="cpl-in"><svg class="cpl-cup" viewBox="0 0 120 120" fill="none"><defs><clipPath id="cpl-c"><path d="M22 46h62v26c0 17-13 30-31 30s-31-13-31-30z"/></clipPath></defs><g clip-path="url(#cpl-c)"><rect class="cpl-fill" x="20" y="44" width="66" height="60" fill="#E9F056"/></g><path d="M22 46h62v26c0 17-13 30-31 30s-31-13-31-30z" stroke="#E9F056" stroke-width="4" stroke-linejoin="round"/><path d="M84 54h6a10 10 0 0 1 0 20h-8" stroke="#E9F056" stroke-width="4" stroke-linecap="round"/><path class="cpl-st s1" d="M36 34c-6-6 6-10 0-18" stroke="#E9F056" stroke-width="4" stroke-linecap="round"/><path class="cpl-st s2" d="M53 34c-6-6 6-10 0-18" stroke="#E9F056" stroke-width="4" stroke-linecap="round"/><path class="cpl-st s3" d="M70 34c-6-6 6-10 0-18" stroke="#E9F056" stroke-width="4" stroke-linecap="round"/></svg><div class="cpl-wm">${[...'cafepaglus'].map((c,i)=>`<span style="--i:${i}">${c}</span>`).join('')}</div><div class="cpl-sc">know before you go</div></div><i class="cpl-pg"></i>`;
r.classList.add('cp-ld');r.appendChild(el);
let done=0;const go=()=>{if(done)return;done=1;r.classList.remove('cp-ld');el.classList.add('out');setTimeout(()=>el.remove(),900)};
const loaded=new Promise(ok=>document.readyState=='complete'?ok():addEventListener('load',ok,{once:true})),fonts=document.fonts?document.fonts.ready:0;
Promise.race([Promise.all([loaded,fonts,new Promise(ok=>setTimeout(ok,1150))]),new Promise(ok=>setTimeout(ok,3200))]).then(go);
el.addEventListener('pointerdown',go)})();
})();
