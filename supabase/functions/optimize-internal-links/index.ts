import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map of keywords to internal URLs for contextual linking
const LINK_MAP: Record<string, { url: string; anchor: string }> = {
  'fleet wrap': { url: '/fleet-wraps-chicago/', anchor: 'fleet wraps' },
  'truck wrap': { url: '/truck-wraps-chicago/', anchor: 'truck wraps' },
  'van wrap': { url: '/van-wraps-chicago/', anchor: 'van wraps' },
  'box truck': { url: '/boxtruck/', anchor: 'box truck wraps' },
  'sprinter': { url: '/sprinter/', anchor: 'Sprinter van wraps' },
  'color change': { url: '/colorchange/', anchor: 'color change wraps' },
  'partial wrap': { url: '/partial-wraps/', anchor: 'partial wraps' },
  'food truck': { url: '/food-truck-wraps-chicago/', anchor: 'food truck wraps' },
  'boat wrap': { url: '/boat-wraps-chicago/', anchor: 'boat wraps' },
  'hvac': { url: '/hvac-van-wraps-chicago/', anchor: 'HVAC vehicle wraps' },
  'plumb': { url: '/plumbing-van-wraps-chicago/', anchor: 'plumbing van wraps' },
  'electrician': { url: '/electrician-vehicle-wraps-chicago/', anchor: 'electrician vehicle wraps' },
  'contractor': { url: '/contractor-vehicle-wraps-chicago/', anchor: 'contractor vehicle wraps' },
  'delivery': { url: '/delivery-fleet-wraps-chicago/', anchor: 'delivery fleet wraps' },
  'landscap': { url: '/landscaping-truck-wraps-chicago/', anchor: 'landscaping truck wraps' },
  'moving': { url: '/moving-truck-wraps-chicago/', anchor: 'moving truck wraps' },
  'wrap cost': { url: '/vehicle-wrap-cost-chicago/', anchor: 'vehicle wrap cost' },
  'wrap pric': { url: '/vehicle-wrap-cost-chicago/', anchor: 'wrap pricing' },
  'how much': { url: '/vehicle-wrap-cost-chicago/', anchor: 'wrap cost guide' },
  'vinyl': { url: '/vinyl-guide/', anchor: 'vinyl material guide' },
  '3m': { url: '/vinyl-guide/', anchor: '3M wrap vinyl' },
  'avery': { url: '/vinyl-guide/', anchor: 'Avery Dennison vinyl' },
  'wrap removal': { url: '/wrap-removal/', anchor: 'wrap removal' },
  'wrap care': { url: '/care/', anchor: 'wrap care guide' },
  'maintenance': { url: '/care/', anchor: 'wrap maintenance' },
  'warranty': { url: '/warranty/', anchor: 'wrap warranty' },
  'tesla': { url: '/ev-wraps/', anchor: 'Tesla wraps' },
  'rivian': { url: '/ev-wraps/', anchor: 'Rivian wraps' },
  'electric vehicle': { url: '/ev-wraps/', anchor: 'EV wraps' },
  'wall wrap': { url: '/wallwraps/', anchor: 'wall wraps' },
  'roi': { url: '/roi/', anchor: 'wrap ROI calculator' },
  'estimate': { url: '/estimate/', anchor: 'free estimate' },
  'free quote': { url: '/estimate/', anchor: 'get a free quote' },
  'portfolio': { url: '/portfolio/', anchor: 'our portfolio' },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing config');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all blog posts
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('id,slug,content,title')
      .order('published_at', { ascending: false });

    if (!posts?.length) {
      return new Response(JSON.stringify({ message: 'No blog posts to optimize' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let totalLinksAdded = 0;
    const updates: { id: string; slug: string; linksAdded: number }[] = [];

    for (const post of posts) {
      let content = post.content;
      let linksAdded = 0;
      const postUrl = `/post/${post.slug}/`;

      for (const [keyword, linkInfo] of Object.entries(LINK_MAP)) {
        // Don't link to the page itself
        if (postUrl.includes(linkInfo.url.replace(/\//g, ''))) continue;

        // Check if this link already exists in content
        if (content.includes(`href="${linkInfo.url}"`)) continue;
        if (content.includes(`href="/${linkInfo.url.replace(/^\//, '')}"`)) continue;

        // Find keyword mentions NOT already inside <a> tags
        const regex = new RegExp(`(?<![<a][^>]*>)\\b(${keyword}[s]?)\\b(?![^<]*<\\/a>)`, 'i');
        const match = content.match(regex);

        if (match) {
          // Only add max 3 internal links per post to avoid over-optimization
          if (linksAdded >= 3) break;

          // Replace first occurrence only
          content = content.replace(
            regex,
            `<a href="${linkInfo.url}" title="${linkInfo.anchor}">${match[1]}</a>`
          );
          linksAdded++;
        }
      }

      if (linksAdded > 0) {
        const { error } = await supabase.from('blog_posts').update({ content }).eq('id', post.id);
        if (!error) {
          totalLinksAdded += linksAdded;
          updates.push({ id: post.id, slug: post.slug, linksAdded });
        }
      }
    }

    // Also optimize city pages
    const { data: cityPages } = await supabase.from('city_pages').select('id,slug,content');
    for (const page of cityPages || []) {
      let content = page.content;
      let linksAdded = 0;
      for (const [keyword, linkInfo] of Object.entries(LINK_MAP)) {
        if (content.includes(`href="${linkInfo.url}"`)) continue;
        const regex = new RegExp(`(?<![<a][^>]*>)\\b(${keyword}[s]?)\\b(?![^<]*<\\/a>)`, 'i');
        const match = content.match(regex);
        if (match && linksAdded < 3) {
          content = content.replace(regex, `<a href="${linkInfo.url}" title="${linkInfo.anchor}">${match[1]}</a>`);
          linksAdded++;
        }
      }
      if (linksAdded > 0) {
        await supabase.from('city_pages').update({ content }).eq('id', page.id);
        totalLinksAdded += linksAdded;
      }
    }

    // Also optimize case studies
    const { data: caseStudies } = await supabase.from('case_studies').select('id,slug,content');
    for (const cs of caseStudies || []) {
      let content = cs.content;
      let linksAdded = 0;
      for (const [keyword, linkInfo] of Object.entries(LINK_MAP)) {
        if (content.includes(`href="${linkInfo.url}"`)) continue;
        const regex = new RegExp(`(?<![<a][^>]*>)\\b(${keyword}[s]?)\\b(?![^<]*<\\/a>)`, 'i');
        const match = content.match(regex);
        if (match && linksAdded < 3) {
          content = content.replace(regex, `<a href="${linkInfo.url}" title="${linkInfo.anchor}">${match[1]}</a>`);
          linksAdded++;
        }
      }
      if (linksAdded > 0) {
        await supabase.from('case_studies').update({ content }).eq('id', cs.id);
        totalLinksAdded += linksAdded;
      }
    }

    await supabase.from('growth_log').insert({
      action_type: 'internal-links-optimized',
      details: { total_links_added: totalLinksAdded, posts_updated: updates.length, updates },
    });

    console.log(`✅ Internal linking: ${totalLinksAdded} links added across ${updates.length} posts`);
    return new Response(JSON.stringify({ success: true, totalLinksAdded, postsUpdated: updates.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Internal linking error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
