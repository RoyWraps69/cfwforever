// Fetches live GMB review data and updates the page
(function(){
  var API = 'https://vqjrldzmthbkayjzatnl.supabase.co/functions/v1/gmb-reviews';
  fetch(API).then(function(r){return r.json()}).then(function(d){
    if(!d||!d.reviewCount)return;
    // Update visible review badges — Set() prevents double-updating elements matching multiple selectors
    var raw = document.querySelectorAll('.gmb-hdr span, .gmb-header span, .gmb-header small, .gmb-review-count, #hdr-gmb-text');
    var seen = new Set();
    var badges = [];
    raw.forEach(function(el){ if(!seen.has(el)){ seen.add(el); badges.push(el); } });
    badges.forEach(function(el){
      if(el.dataset.gmbUpdated) return; // guard against repeat injection
      if(el.closest('.gmb-hdr')){
        el.textContent='★★★★★ '+d.rating.toFixed(1)+' · '+d.reviewCount;
      } else if(el.tagName==='SMALL'){
        el.textContent=d.rating.toFixed(1)+' · '+d.reviewCount+' reviews';
      } else {
        el.textContent='★★★★★ '+d.rating.toFixed(1)+' ('+d.reviewCount+')';
      }
      el.dataset.gmbUpdated='1';
    });
    // Inject aggregateRating into ONLY the first LocalBusiness schema. Prevents duplicate review snippets
    // when a page has multiple eligible schemas (LocalBusiness + Service + ProfessionalService).
    var scripts=document.querySelectorAll('script[type="application/ld+json"]');
    var injected=false;
    scripts.forEach(function(s){
      if(injected) return;
      try{
        var j=JSON.parse(s.textContent);
        var types = Array.isArray(j['@type']) ? j['@type'] : [j['@type']];
        var isPrimary = types.some(function(t){
          return t==='LocalBusiness'||t==='ProfessionalService'||t==='AutoRepair';
        });
        if(isPrimary){
          j.aggregateRating={
            '@type':'AggregateRating',
            'ratingValue':d.rating.toFixed(1),
            'reviewCount':String(d.reviewCount),
            'bestRating':'5'
          };
          s.textContent=JSON.stringify(j);
          injected=true;
        }
      }catch(e){}
    });
    // Update footer/body review text links
    var reviewLinks=document.querySelectorAll('a[href*="writereview"]');
    reviewLinks.forEach(function(a){
      if(a.dataset.gmbUpdated) return;
      if(a.textContent.indexOf('5.0')>-1||a.textContent.indexOf('★')>-1){
        a.textContent='★★★★★ '+d.rating.toFixed(1)+' ('+d.reviewCount+' reviews) on Google — Leave a Review →';
        a.dataset.gmbUpdated='1';
      }
    });
  }).catch(function(){});
})();
