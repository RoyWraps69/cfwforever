/* Loads AI-generated blog posts from the database and prepends them to the blog index */
(function(){
  var API = 'https://lniyugkiguujtxpzlapi.supabase.co/rest/v1/blog_posts?select=title,slug,excerpt,category,published_at,og_image&order=published_at.desc&limit=50';
  var ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuaXl1Z2tpZ3V1anR4cHpsYXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMDI0NzUsImV4cCI6MjA4ODc3ODQ3NX0.g7XSw4zs3I1sZNTiVQWyWHyLNIEtP35E5TRcOODPxy8';

  fetch(API, {
    headers: { 'apikey': ANON, 'Authorization': 'Bearer ' + ANON }
  })
  .then(function(r){ return r.json(); })
  .then(function(posts){
    if(!posts || !posts.length) return;

    var list = document.querySelector('.post-list');
    if(!list) return;

    // Build HTML for AI-generated posts and prepend
    var html = '';
    for(var i = 0; i < posts.length; i++){
      var p = posts[i];
      var date = new Date(p.published_at);
      var dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      var isNew = (Date.now() - date.getTime()) < 7 * 86400000; // 7 days
      html += '<li>' +
        '<a href="/post/' + p.slug + '/">' + escapeHtml(p.title) + '</a>' +
        (isNew ? '<span class="new-badge">NEW</span>' : '') +
        '<span style="display:inline-block;margin-left:8px;font-size:.7rem;color:rgba(255,255,255,.35);font-family:var(--H)">' + dateStr + '</span>' +
        (p.category ? '<span style="display:inline-block;margin-left:8px;font-size:.65rem;color:var(--gold);opacity:.7;font-family:var(--H)">' + escapeHtml(p.category) + '</span>' : '') +
        '<p>' + escapeHtml(p.excerpt) + '</p>' +
        '</li>';
    }

    // Insert AI posts at the top with a section header
    var header = document.createElement('li');
    header.style.cssText = 'border-bottom:2px solid var(--gold);padding:12px 0 8px;margin-bottom:4px';
    header.innerHTML = '<span style="font-family:var(--H);font-weight:800;color:var(--gold);font-size:.85rem;letter-spacing:.05em">✨ LATEST AI-GENERATED INSIGHTS</span>';
    
    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    
    // Prepend in reverse to maintain order
    var firstChild = list.firstChild;
    list.insertBefore(header, firstChild);
    
    var items = wrapper.querySelectorAll('li');
    var ref = header.nextSibling;
    for(var j = 0; j < items.length; j++){
      list.insertBefore(items[j], ref);
    }
  })
  .catch(function(e){ console.error('Blog posts load error:', e); });

  function escapeHtml(str){
    if(!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
})();
