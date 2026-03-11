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
    // Update JSON-LD schema reviewCount
    var scripts=document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(function(s){
      try{
        var j=JSON.parse(s.textContent);
        if(j.aggregateRating){
          j.aggregateRating.ratingValue=d.rating.toFixed(1);
          j.aggregateRating.reviewCount=String(d.reviewCount);
          s.textContent=JSON.stringify(j);
        }
      }catch(e){}
    });
    // Update footer/body review text
    var reviewLinks=document.querySelectorAll('a[href*="writereview"]');
    reviewLinks.forEach(function(a){
      if(a.textContent.indexOf('5.0')>-1){
        a.textContent='★★★★★ '+d.rating.toFixed(1)+' ('+d.reviewCount+' reviews) on Google — Leave a Review →';
      }
    });
  }).catch(function(){});
})();
