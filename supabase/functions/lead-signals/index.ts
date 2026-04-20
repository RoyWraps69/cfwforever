// CFW Phase 4a — Pre-Enrichment Signals
// POST { job_id }
// Gathers: Google Places (reviews, hours, photos), Website Scrape (about page, team, services), Bing News (recent mentions)
// Writes to: jobs.enrichment_data JSONB — this becomes the input to lead-enrich's profile builder

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getSecret(sb: any, name: string): Promise<string | null> {
  const { data } = await sb.from("app_secrets").select("value").eq("name", name).maybeSingle();
  return data?.value || null;
}

// ===== Google Places Text Search =====
async function googlePlacesSearch(query: string, apiKey: string) {
  try {
    const r = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d?.results?.[0] || null;
  } catch { return null; }
}

async function googlePlaceDetails(placeId: string, apiKey: string) {
  try {
    const fields = "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,reviews,opening_hours,business_status,types,url,photos";
    const r = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d?.result || null;
  } catch { return null; }
}

// ===== Website scrape =====
async function scrapeWebsite(url: string) {
  try {
    const r = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CFW-Intel/1.0)" },
      redirect: "follow",
    });
    if (!r.ok) return null;
    const html = await r.text();
    // Strip scripts/styles, extract text
    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "");
    const title = (cleaned.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || "";
    const metaDesc = (cleaned.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) || [])[1] || "";
    const ogDesc = (cleaned.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) || [])[1] || "";
    
    // Pull visible text, limit size
    const textOnly = cleaned.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const excerpt = textOnly.slice(0, 3000);
    
    // Extract phone numbers
    const phones = [...new Set([...textOnly.matchAll(/\(?\b\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g)].map(m => m[0]))].slice(0, 5);
    // Extract emails
    const emails = [...new Set([...textOnly.matchAll(/[\w.+-]+@[\w-]+\.[\w.-]+/g)].map(m => m[0].toLowerCase()))].slice(0, 10);
    // Social links
    const socials: any = {};
    const fbMatch = html.match(/https?:\/\/(?:www\.)?facebook\.com\/[^"'\s<>)]+/i);
    const igMatch = html.match(/https?:\/\/(?:www\.)?instagram\.com\/[^"'\s<>)]+/i);
    const ytMatch = html.match(/https?:\/\/(?:www\.)?youtube\.com\/[^"'\s<>)]+/i);
    const liMatch = html.match(/https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[^"'\s<>)]+/i);
    const ttMatch = html.match(/https?:\/\/(?:www\.)?tiktok\.com\/@?[^"'\s<>)]+/i);
    if (fbMatch) socials.facebook = fbMatch[0];
    if (igMatch) socials.instagram = igMatch[0];
    if (ytMatch) socials.youtube = ytMatch[0];
    if (liMatch) socials.linkedin = liMatch[0];
    if (ttMatch) socials.tiktok = ttMatch[0];

    return { title, meta_description: metaDesc || ogDesc, excerpt, phones, emails, socials, status: r.status };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ===== Bing News via DuckDuckGo Instant Answers (free, no key needed) =====
async function newsSignals(companyName: string) {
  try {
    // Use DuckDuckGo as a free news search
    const q = `"${companyName}" Chicago`;
    const r = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0 CFW-Intel/1.0" },
    });
    if (!r.ok) return { found: 0 };
    const d = await r.json();
    return {
      abstract: d.Abstract || "",
      abstract_source: d.AbstractSource || "",
      related_topics: (d.RelatedTopics || []).slice(0, 5).map((t: any) => t.Text).filter(Boolean),
    };
  } catch { return { found: 0 }; }
}

// ===== BBB lookup (free scrape) =====
async function bbbLookup(companyName: string, city: string) {
  try {
    const q = `${companyName} ${city}`;
    const r = await fetch(`https://www.bbb.org/search?find_country=USA&find_text=${encodeURIComponent(q)}`, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CFW-Intel/1.0)" },
    });
    if (!r.ok) return null;
    const html = await r.text();
    // Very lightweight — just extract first result's rating if visible
    const ratingMatch = html.match(/data-rating=["']([A-F][+\-]?)["']/i);
    const accreditedMatch = /accredited-business/i.test(html);
    return { rating: ratingMatch?.[1] || null, accredited: accreditedMatch };
  } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  try {
    const { job_id } = await req.json();
    if (!job_id) {
      return new Response(JSON.stringify({ error: "job_id required" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const sb = getClient();
    const { data: job, error } = await sb.from("jobs").select("*").eq("id", job_id).single();
    if (error || !job) {
      return new Response(JSON.stringify({ error: "job not found" }), {
        status: 404, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const bundle: any = { gathered_at: new Date().toISOString(), sources: {} };
    const googleKey = await getSecret(sb, "GOOGLE_PLACES_API_KEY");

    // 1. Google Places
    if (googleKey) {
      const query = `${job.customer_name} ${job.address || job.city || "Chicago"}`;
      const place = await googlePlacesSearch(query, googleKey);
      if (place?.place_id) {
        const details = await googlePlaceDetails(place.place_id, googleKey);
        bundle.sources.google_places = {
          place_id: place.place_id,
          name: details?.name,
          address: details?.formatted_address,
          phone: details?.formatted_phone_number,
          website: details?.website,
          rating: details?.rating,
          review_count: details?.user_ratings_total,
          business_status: details?.business_status,
          types: details?.types,
          url: details?.url,
          recent_reviews: (details?.reviews || []).slice(0, 5).map((r: any) => ({
            author: r.author_name,
            rating: r.rating,
            text: (r.text || "").slice(0, 500),
            time: r.relative_time_description,
          })),
          hours: details?.opening_hours?.weekday_text,
          photo_count: details?.photos?.length || 0,
        };
      } else {
        bundle.sources.google_places = { not_found: true };
      }
    } else {
      bundle.sources.google_places = { skipped: "no GOOGLE_PLACES_API_KEY" };
    }

    // 2. Website scrape (try direct first, then Google's website if discovered)
    let siteUrl = job.website || bundle.sources.google_places?.website;
    if (siteUrl) {
      if (!siteUrl.startsWith("http")) siteUrl = "https://" + siteUrl;
      bundle.sources.website = { url: siteUrl, ...(await scrapeWebsite(siteUrl)) };
    }

    // 3. News/public mentions (free)
    const news = await newsSignals(job.customer_name);
    bundle.sources.news = news;

    // 4. BBB (free scrape)
    if (job.customer_name && job.city) {
      bundle.sources.bbb = await bbbLookup(job.customer_name, job.city);
    }

    // Store
    await sb.from("jobs").update({
      enrichment_data: bundle,
      // If Places discovered a phone/website we didn't have, fill those in
      ...(bundle.sources.google_places?.website && !job.website ? {
        website: bundle.sources.google_places.website,
        domain: String(bundle.sources.google_places.website).replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0],
      } : {}),
    }).eq("id", job_id);

    return new Response(JSON.stringify({
      status: "ok",
      job_id,
      sources_gathered: Object.keys(bundle.sources),
      google_places: bundle.sources.google_places?.not_found ? "not found" : (bundle.sources.google_places?.skipped ? "skipped" : "found"),
      place_rating: bundle.sources.google_places?.rating,
      review_count: bundle.sources.google_places?.review_count,
      website_scraped: !!bundle.sources.website?.excerpt,
      socials_found: bundle.sources.website?.socials ? Object.keys(bundle.sources.website.socials) : [],
      phones_found: bundle.sources.website?.phones?.length || 0,
      news_abstract: (bundle.sources.news?.abstract || "").slice(0, 100),
    }), { headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message, stack: (e as Error).stack?.slice(0, 500) }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
