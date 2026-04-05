// Sticky Mobile CTA Bar - injected on all pages
// CLS-safe: uses transform only, no layout-shifting paddingBottom
(function(){
  if(window.innerWidth>768) return;
  if(document.getElementById('sticky-cta')) return;
  var bar=document.createElement('div');
  bar.id='sticky-cta';
  // Fixed position + transform only = zero CLS
  bar.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:8000;background:rgba(10,10,10,.97);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid rgba(245,197,24,.3);padding:10px 16px;display:flex;gap:10px;align-items:center;justify-content:center;transform:translateY(100%);transition:transform .3s ease;will-change:transform';
  bar.innerHTML='<a href="tel:+13125971286" style="flex:1;max-width:180px;background:#F5C518;color:#000;font-family:\'Barlow Condensed\',sans-serif;font-size:1rem;font-weight:900;letter-spacing:.05em;text-transform:uppercase;text-decoration:none;padding:11px 16px;border-radius:8px;text-align:center;display:flex;align-items:center;justify-content:center;gap:6px">\uD83D\uDCDE Call Now</a><a href="/calculator/" style="flex:1;max-width:180px;background:transparent;color:#F5C518;font-family:\'Barlow Condensed\',sans-serif;font-size:1rem;font-weight:900;letter-spacing:.05em;text-transform:uppercase;text-decoration:none;padding:11px 16px;border-radius:8px;text-align:center;border:1px solid rgba(245,197,24,.5);display:flex;align-items:center;justify-content:center;gap:6px">Instant Price</a>';
  document.body.appendChild(bar);
  // NO paddingBottom - fixed element doesn't need it and it causes CLS
  var shown=false;
  window.addEventListener('scroll',function(){
    if(window.scrollY>300&&!shown){bar.style.transform='translateY(0)';shown=true;}
    else if(window.scrollY<=300&&shown){bar.style.transform='translateY(100%)';shown=false;}
  },{passive:true});
})();
