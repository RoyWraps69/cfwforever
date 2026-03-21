// Inline Quote Form - injects a mini form into .final-cta sections
(function(){
  var cta = document.querySelector('section.final-cta');
  if(!cta) return;
  // Don't inject on the estimate page itself
  if(window.location.pathname.indexOf('/estimate') === 0) return;
  
  // Add CSS
  var style = document.createElement('style');
  style.textContent = '.iqf{margin-top:28px;background:rgba(0,0,0,.3);border-radius:12px;padding:24px;border:1px solid rgba(245,197,24,.15)}.iqf h3{font-family:\'Barlow Condensed\',sans-serif;font-size:1.1rem;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:.06em;margin:0 0 16px;text-align:left}.iqf-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}.iqf input,.iqf select{width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:7px;color:#fff;font-family:\'Barlow\',sans-serif;font-size:.9rem;padding:10px 12px;outline:none;-webkit-appearance:none;appearance:none;transition:border-color .2s}.iqf select{background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\' viewBox=\'0 0 10 6\'%3E%3Cpath d=\'M1 1l4 4 4-4\' stroke=\'rgba(255,255,255,.4)\' stroke-width=\'1.5\' fill=\'none\' stroke-linecap=\'round\'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px}.iqf input:focus,.iqf select:focus{border-color:#F5C518}.iqf input::placeholder{color:rgba(255,255,255,.3)}.iqf-btn{width:100%;margin-top:12px;background:#F5C518;color:#000;font-family:\'Bebas Neue\',\'Barlow Condensed\',sans-serif;font-size:1.1rem;font-weight:700;letter-spacing:.06em;border:none;border-radius:7px;padding:13px;cursor:pointer;transition:background .2s}.iqf-btn:hover{background:#ffd700}.iqf-note{font-size:.75rem;color:rgba(255,255,255,.3);text-align:center;margin-top:8px}.iqf-success{display:none;text-align:center;padding:20px;color:#F5C518;font-family:\'Barlow Condensed\',sans-serif;font-size:1.2rem;font-weight:700}@media(max-width:600px){.iqf-row{grid-template-columns:1fr}}';
  document.head.appendChild(style);
  
  // Determine page context for pre-filling vehicle type
  var path = window.location.pathname;
  var vehicleDefault = '';
  if(path.indexOf('boxtruck')>-1||path.indexOf('box-truck')>-1) vehicleDefault='box-truck-16-20';
  else if(path.indexOf('sprinter')>-1) vehicleDefault='sprinter-van';
  else if(path.indexOf('van')>-1||path.indexOf('commercial')>-1||path.indexOf('fleet')>-1) vehicleDefault='cargo-van';
  else if(path.indexOf('ev-wrap')>-1||path.indexOf('electric')>-1) vehicleDefault='electric-vehicle';
  else if(path.indexOf('colorchange')>-1||path.indexOf('color-change')>-1) vehicleDefault='car';
  
  var formHTML = '<div class="iqf">' +
    '<h3>Get Your Free Quote in 60 Seconds</h3>' +
    '<form name="inline-quote" data-netlify="true" data-netlify-honeypot="bot-field" method="POST" action="/estimate/thank-you/" onsubmit="return window._iqfSubmit(this,event)">' +
    '<input type="hidden" name="form-name" value="inline-quote"/>' +
    '<input type="hidden" name="source-page" value="' + path + '"/>' +
    '<p style="display:none"><input name="bot-field"/></p>' +
    '<div class="iqf-row">' +
    '<input type="text" name="name" placeholder="Your Name *" required/>' +
    '<input type="tel" name="phone" placeholder="Phone Number *" required/>' +
    '</div>' +
    '<div class="iqf-row" style="margin-top:12px">' +
    '<select name="vehicle-type">' +
    '<option value="">Vehicle Type...</option>' +
    '<option value="cargo-van"' + (vehicleDefault==='cargo-van'?' selected':'') + '>Cargo Van</option>' +
    '<option value="sprinter-van"' + (vehicleDefault==='sprinter-van'?' selected':'') + '>Sprinter Van</option>' +
    '<option value="box-truck-16-20"' + (vehicleDefault==='box-truck-16-20'?' selected':'') + '>Box Truck 16-20ft</option>' +
    '<option value="box-truck-22-26"' + (vehicleDefault==='box-truck-22-26'?' selected':'') + '>Box Truck 22-26ft</option>' +
    '<option value="electric-vehicle"' + (vehicleDefault==='electric-vehicle'?' selected':'') + '>Electric Vehicle</option>' +
    '<option value="car"' + (vehicleDefault==='car'?' selected':'') + '>Car / SUV</option>' +
    '<option value="other">Other</option>' +
    '</select>' +
    '<select name="fleet-size">' +
    '<option value="1">1 Vehicle</option>' +
    '<option value="2-4">2-4 Vehicles</option>' +
    '<option value="5-9">5-9 Vehicles</option>' +
    '<option value="10+">10+ Vehicles</option>' +
    '</select>' +
    '</div>' +
    '<button type="submit" class="iqf-btn">Get My Free Estimate &rarr;</button>' +
    '<p class="iqf-note">No spam. We respond within 2 hours.</p>' +
    '</form>' +
    '<div class="iqf-success">&#10003; Request received! We\'ll call you within 2 hours.</div>' +
    '</div>';
  
  cta.insertAdjacentHTML('beforeend', formHTML);
  
  // Handle form submission via fetch (no page redirect)
  window._iqfSubmit = function(form, e) {
    e.preventDefault();
    var data = new FormData(form);
    fetch('/', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: new URLSearchParams(data).toString()})
      .then(function(){
        form.style.display='none';
        form.parentNode.querySelector('.iqf-success').style.display='block';
        // GTM conversion event
        if(window.dataLayer) window.dataLayer.push({'event':'inline_quote_submit','eventCategory':'Lead','eventAction':'Inline Form Submit'});
      })
      .catch(function(){
        // Fallback: redirect to thank you page
        window.location.href = '/estimate/thank-you/';
      });
    return false;
  };
})();
