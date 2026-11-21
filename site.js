/* cafepaglus shared runtime. Loaded after data/cafes.js on every page. */
(function(){
const S=window.SITE={},D=window.CAFES||{cafes:[],demo:[]},f=(location.pathname.split('/').pop()||'index').replace(/\.html$/,'')+'.html';  /* Cloudflare serves /about for about.html, so compare without the extension */
S.cafes=D.cafes;S.demo=D.demo;
S.IM=new Proxy({},{get:(_,k)=>typeof k=='string'?`img/${k}.webp`:void 0});   /* full size */
S.TH=new Proxy({},{get:(_,k)=>typeof k=='string'?`img/${k}-sm.webp`:void 0}); /* thumbnail */
S.cafeUrl=id=>`cafe-${id}.html`;S.abs=p=>new URL(p,location.href).href;
/* Contact details. Fill these in once; suggest.html, privacy.html and terms.html read them from here.
   whatsapp: digits only with country code, e.g. 919876543210 (no + or spaces). email: full address. instagram: handle without @. Leave '' to hide. */
S.contact={whatsapp:'',email:'',instagram:''};
S.contactHtml=()=>{const c=S.contact,o=[];if(c.whatsapp)o.push(`<a href="https://wa.me/${c.whatsapp}" rel="noopener">WhatsApp</a>`);if(c.email)o.push(`<a href="mailto:${c.email}">${c.email}</a>`);if(c.instagram)o.push(`<a href="https://www.instagram.com/${c.instagram}" rel="noopener">Instagram @${c.instagram}</a>`);return o.join(' · ')};
/* flip live to 1 when a page ships. Header shows the first four, footer shows every live page. */
S.pages=[['list.html','the list',1],['pick.html','pick for me',1],['index.html#how','how we score',1],['about.html','our story',1],['index.html#trust','why trust us',1],['suggest.html','suggest a cafe',1],['privacy.html','privacy',1],['terms.html','terms',1]];
const st=document.createElement('style');st.textContent='header nav a.on{background:color-mix(in srgb,currentColor 14%,transparent)}[data-foot] a{text-decoration:underline;text-underline-offset:3px;margin-right:14px;display:inline-block;padding:6px 0}[data-foot] p{margin-top:6px}';document.head.appendChild(st);
S.nav=()=>{const h=document.getElementById('hd');if(!h)return;h.innerHTML=`<div class="w"><a class="logo" href="index.html">cafepaglus</a><nav aria-label="main">${S.pages.slice(0,4).filter(p=>p[2]).map(p=>`<a ${p[0]==f?'class="on" aria-current="page" ':''}href="${p[0]}">${p[1]}</a>`).join('')}<button class="sb" data-sh aria-label="saved cafes">saved ♡ <b id="cnt"></b></button></nav></div>`};
S.foot=()=>document.querySelectorAll('[data-foot]').forEach(e=>{e.innerHTML=`<div>${S.pages.filter(p=>p[2]&&p[0]!=f).map(p=>`<a href="${p[0]}">${p[1]}</a>`).join('')}</div><p>demo build · scores, verdicts and some details are placeholders until we finish our visits.</p>`});
})();
