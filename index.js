/* cafepaglus shared navigation: Home · List · How we score · Our story
   Loaded right after SITE.nav() on index.html, list.html and about.html.
   1) phones: an always-visible bottom tab bar
   2) desktop: makes sure the top bar links to the same four places */
(function(){
  var f=location.pathname.split('/').pop();
  var page=/^about/.test(f)?'about':/^list/.test(f)?'list':(f===''||/^index/.test(f))?'home':'';
  var home=page==='home';
  var T=[['home','Home',home?'#top':'index.html'],
         ['list','List','list.html'],
         ['how','How we score',home?'#how':'index.html#how'],
         ['about','Our story','about.html']];

  var hasDock=!!document.getElementById('dock');   /* list.html has its own shortlist dock */
  var st=document.createElement('style');
  st.textContent=
   '#tabs{position:fixed;left:50%;bottom:calc(12px + env(safe-area-inset-bottom,0px));transform:translate(-50%,0);z-index:55;display:flex;gap:2px;padding:6px;max-width:calc(100vw - 16px);border-radius:32px;background:color-mix(in srgb,var(--bg) 80%,transparent);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid var(--line);box-shadow:0 10px 30px #0003;transition:transform .5s cubic-bezier(.2,.8,.2,1)}'+
   '#tabs.hide{transform:translate(-50%,160%)}'+
   '#tabs a{padding:12px 13px;border-radius:26px;font-size:14px;font-weight:500;white-space:nowrap;color:var(--ink)}'+
   '#tabs a.on{background:var(--ink);color:var(--bg)}'+
   '@media(max-width:380px){#tabs a{padding:12px 9px;font-size:13px}}'+
   '@media(min-width:701px){#tabs{display:none}}'+
   'header nav a.on{background:color-mix(in srgb,currentColor 14%,transparent)}'+
   '@media(max-width:700px){footer{padding-bottom:calc(96px + env(safe-area-inset-bottom,0px))}'+
   (hasDock?'#dock{bottom:calc(82px + env(safe-area-inset-bottom,0px))}#t{bottom:calc(148px + env(safe-area-inset-bottom,0px))}':'')+'}';
  document.head.appendChild(st);

  /* bottom tab bar */
  var nav=document.createElement('nav');nav.id='tabs';nav.setAttribute('aria-label','site');
  T.forEach(function(t){var a=document.createElement('a');a.href=t[2];a.textContent=t[1];
    if(t[0]===page){a.className='on';a.setAttribute('aria-current','page')}nav.appendChild(a)});
  document.body.appendChild(nav);

  /* desktop top bar: replace whatever links SITE.nav() drew, keep the saved button */
  var n=document.querySelector('#hd nav');
  if(n){
    [].slice.call(n.querySelectorAll('a')).forEach(function(a){
      if(!a.hasAttribute('data-sh')&&!a.classList.contains('sb'))a.remove()});
    var fr=document.createDocumentFragment();
    T.forEach(function(t){var a=document.createElement('a');a.href=t[2];a.textContent=t[1];
      if(t[0]===page){a.className='on';a.setAttribute('aria-current','page')}fr.appendChild(a)});
    n.insertBefore(fr,n.firstChild);
  }
})();
