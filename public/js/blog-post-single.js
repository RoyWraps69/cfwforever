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

    // Extract key takeaways from content (first 5 <strong> or <b> items, or first 5 <li> items)
    var takeaways = extractTakeaways(post.content);

    // Insert Key Takeaways box after date, before first H2
    if(takeaways.length > 0 && contentEl){
      var wordCount = post.content.replace(/<[^>]+>/g,'').split(/\s+/).length;
      var readTime = Math.max(1, Math.ceil(wordCount / 250));
      var tkBox = document.createElement('div');
      tkBox.className = 'key-takeaways-box';
      tkBox.setAttribute('role', 'note');
      tkBox.setAttribute('aria-label', 'Key takeaways from this article');
      tkBox.style.cssText = 'background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.25);border-left:4px solid #FFD700;padding:24px 28px;margin:28px 0 36px';
      var tkHTML = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px"><span style="font-size:1.1rem">⚡</span><p style="font-family:monospace;font-size:.65rem;letter-spacing:.14em;text-transform:uppercase;color:#FFD700;margin:0">Key Takeaways</p></div><ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px">';
      for(var t=0; t<takeaways.length; t++){
        tkHTML += '<li style="display:flex;align-items:flex-start;gap:10px;font-size:.88rem;color:#ddd;line-height:1.6"><span style="color:#FFD700;flex-shrink:0;margin-top:2px">→</span><span>' + escapeHtml(takeaways[t]) + '</span></li>';
      }
      tkHTML += '</ul><p style="font-family:monospace;font-size:.62rem;color:#555;margin-top:16px;padding-top:14px;border-top:1px solid #2a2a2a">Reading time: ' + readTime + ' min · By Roy Wraps · Chicago Fleet Wraps</p>';
      tkBox.innerHTML = tkHTML;

      // Insert before content
      contentEl.parentNode.insertBefore(tkBox, contentEl);
    }

    // Inject Article JSON-LD schema
    var wordCount2 = post.content.replace(/<[^>]+>/g,'').split(/\s+/).length;
    var articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': post.title,
      'description': post.meta_description,
      'image': 'https://www.chicagofleetwraps.com/images/' + (post.og_image || 'cfw_truck_1.webp'),
      'datePublished': post.published_at,
      'dateModified': post.created_at,
      'author': {
        '@type': 'Person',
        'name': 'Roy Wraps',
        'jobTitle': 'Founder & Lead Installer',
        'worksFor': {'@type': 'Organization', 'name': 'Chicago Fleet Wraps'},
        'url': 'https://www.chicagofleetwraps.com/about'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Chicago Fleet Wraps',
        'logo': {'@type': 'ImageObject', 'url': 'https://www.chicagofleetwraps.com/images/logo-horizontal.png', 'width': 300, 'height': 60}
      },
      'mainEntityOfPage': {'@type': 'WebPage', '@id': 'https://www.chicagofleetwraps.com/post/' + post.slug + '/'},
      'keywords': post.keywords,
      'articleSection': post.category || 'Fleet Wraps Chicago',
      'wordCount': wordCount2
    };
    var script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.textContent = JSON.stringify(articleSchema);
    document.head.appendChild(script1);

    // Also inject the original BlogPosting schema for backward compat
    var blogSchema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': post.title,
      'description': post.meta_description,
      'url': 'https://www.chicagofleetwraps.com/post/' + post.slug + '/',
      'datePublished': post.published_at,
      'image': 'https://www.chicagofleetwraps.com/images/' + (post.og_image || 'cfw_truck_1.webp'),
      'author': {'@type': 'Person', 'name': 'Roy Wraps', 'url': 'https://www.chicagofleetwraps.com/about'},
      'publisher': {'@id': 'https://www.chicagofleetwraps.com/#localbusiness'},
      'keywords': post.keywords
    };
    var script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.textContent = JSON.stringify(blogSchema);
    document.head.appendChild(script2);
  })
  .catch(function(e){ console.error('Blog post load error:', e); });

  function extractTakeaways(html){
    var results = [];
    // Try extracting from <li> items first
    var liMatch = html.match(/<li[^>]*>([^<]{30,200})<\/li>/gi);
    if(liMatch && liMatch.length >= 3){
      for(var i=0; i<Math.min(5, liMatch.length); i++){
        var text = liMatch[i].replace(/<[^>]+>/g,'').trim();
        if(text.length > 20) results.push(text);
      }
      if(results.length >= 3) return results;
    }
    // Fallback: extract from <strong> tags in <p> elements
    var strongMatch = html.match(/<strong[^>]*>([^<]{10,100})<\/strong>/gi);
    if(strongMatch){
      results = [];
      for(var j=0; j<Math.min(5, strongMatch.length); j++){
        var sText = strongMatch[j].replace(/<[^>]+>/g,'').trim();
        if(sText.length > 8) results.push(sText);
      }
    }
    return results;
  }

  function escapeHtml(str){
    if(!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
})();
