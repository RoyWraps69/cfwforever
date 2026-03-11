/* Loads a single AI-generated blog post by slug from the database */
(function(){
  var SUPABASE_URL = 'https://lniyugkiguujtxpzlapi.supabase.co';
  var ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuaXl1Z2tpZ3V1anR4cHpsYXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMDI0NzUsImV4cCI6MjA4ODc3ODQ3NX0.g7XSw4zs3I1sZNTiVQWyWHyLNIEtP35E5TRcOODPxy8';

  // Extract slug from URL path: /post/some-slug/ → some-slug
  var path = window.location.pathname;
  var match = path.match(/\/post\/([^/]+)/);
  if(!match) return;
  var slug = match[1];

  var API = SUPABASE_URL + '/rest/v1/blog_posts?select=*&slug=eq.' + encodeURIComponent(slug) + '&limit=1';

  fetch(API, {
    headers: { 'apikey': ANON, 'Authorization': 'Bearer ' + ANON }
  })
  .then(function(r){ return r.json(); })
  .then(function(posts){
    if(!posts || !posts.length) return;
    var post = posts[0];

    // Update page title and meta
    document.title = post.title + ' | Chicago Fleet Wraps';
    var metaDesc = document.querySelector('meta[name="description"]');
    if(metaDesc) metaDesc.setAttribute('content', post.meta_description);
    var metaKw = document.querySelector('meta[name="keywords"]');
    if(metaKw) metaKw.setAttribute('content', post.keywords);

    // Update OG tags
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if(ogTitle) ogTitle.setAttribute('content', post.title + ' | Chicago Fleet Wraps');
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if(ogDesc) ogDesc.setAttribute('content', post.meta_description);
    var ogImg = document.querySelector('meta[property="og:image"]');
    if(ogImg) ogImg.setAttribute('content', 'https://www.chicagofleetwraps.com/images/' + post.og_image);

    // Update H1
    var h1 = document.querySelector('h1');
    if(h1) h1.textContent = post.title;

    // Update content area
    var contentEl = document.getElementById('blog-body') || document.querySelector('.blog-content') || document.querySelector('.lead');
    if(contentEl){
      contentEl.className = 'blog-content';
      contentEl.innerHTML = post.content;
    }

    // Update breadcrumb
    var bc = document.querySelector('.breadcrumb');
    if(bc){
      bc.innerHTML = '<a href="/">Home</a> › <a href="/blog/">Blog</a> › ' + escapeHtml(post.title);
    }

    // Add publish date
    var dateEl = document.createElement('p');
    var pubDate = new Date(post.published_at);
    dateEl.style.cssText = 'color:rgba(255,255,255,.4);font-size:.85rem;margin-bottom:24px;font-family:var(--H)';
    dateEl.textContent = pubDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' · ' + post.category;
    if(h1 && h1.nextSibling) h1.parentNode.insertBefore(dateEl, h1.nextSibling);

    // Inject BlogPosting JSON-LD
    var schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': post.title,
      'description': post.meta_description,
      'url': 'https://www.chicagofleetwraps.com/post/' + post.slug + '/',
      'datePublished': post.published_at,
      'image': 'https://www.chicagofleetwraps.com/images/' + post.og_image,
      'author': { '@type': 'Organization', 'name': 'Chicago Fleet Wraps', '@id': 'https://www.chicagofleetwraps.com/#localbusiness' },
      'publisher': { '@id': 'https://www.chicagofleetwraps.com/#localbusiness' },
      'keywords': post.keywords
    };
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  })
  .catch(function(e){ console.error('Blog post load error:', e); });

  function escapeHtml(str){
    if(!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
})();
