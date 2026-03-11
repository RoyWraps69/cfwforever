// Fetches live GMB review data and updates the page
(function(){
  var API = 'https://lniyugkiguujtxpzlapi.supabase.co/functions/v1/gmb-reviews';
  fetch(API).then(function(r){return r.json()}).then(function(d){
    if(!d||!d.reviewCount)return;
    // Update visible review badges
    var badges=document.querySelectorAll('.gmb-hdr span, .gmb-review-count');
    badges.forEach(function(el){
      el.textContent='★★★★★ '+d.rating.toFixed(1)+' ('+d.reviewCount+')';
    });
    // Update or inject JSON-LD schema aggregateRating
    var scripts=document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(function(s){
      try{
        var j=JSON.parse(s.textContent);
        // Inject aggregateRating into LocalBusiness, Service, or ProfessionalService schemas
        var types = Array.isArray(j['@type']) ? j['@type'] : [j['@type']];
        var eligible = types.some(function(t){
          return t==='LocalBusiness'||t==='ProfessionalService'||t==='Service'||t==='AutoRepair';
        });
        if(eligible || j.aggregateRating){
          j.aggregateRating={
            '@type':'AggregateRating',
            'ratingValue':d.rating.toFixed(1),
            'reviewCount':String(d.reviewCount),
            'bestRating':'5'
          };
          s.textContent=JSON.stringify(j);
        }
      }catch(e){}
    });
    // Update footer/body review text
    var reviewLinks=document.querySelectorAll('a[href*="writereview"]');
    reviewLinks.forEach(function(a){
      if(a.textContent.indexOf('5.0')>-1||a.textContent.indexOf('★')>-1){
        a.textContent='★★★★★ '+d.rating.toFixed(1)+' ('+d.reviewCount+' reviews) on Google — Leave a Review →';
      }
    });
  }).catch(function(){});
})();
