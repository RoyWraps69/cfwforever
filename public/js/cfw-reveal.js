(function(){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  },{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('[data-reveal]').forEach(function(el){io.observe(el);});
})();
