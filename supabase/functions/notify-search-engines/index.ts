import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DOMAIN = 'https://www.chicagofleetwraps.com';
const INDEXNOW_KEY = 'cfwIndexNow2026key';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const urls: string[] = body.urls || [];
    const pingSitemap: boolean = body.ping_sitemap !== false;

    if (urls.length === 0 && !pingSitemap) {
      return new Response(JSON.stringify({ error: 'No URLs provided and ping_sitemap is false' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: Record<string, unknown> = {};

    // 1. IndexNow — Bing + Yandex (they share IndexNow protocol)
    if (urls.length > 0) {
      const fullUrls = urls.map(u => u.startsWith('http') ? u : `${DOMAIN}${u}`);

      const indexNowPayload = {
        host: 'www.chicagofleetwraps.com',
        key: INDEXNOW_KEY,
        keyLocation: `${DOMAIN}/${INDEXNOW_KEY}.txt`,
        urlList: fullUrls,
      };

      // Submit to both IndexNow endpoints in parallel
      const [bingRes, yandexRes] = await Promise.all([
        fetch('https://api.indexnow.org/indexnow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(indexNowPayload),
        }),
        fetch('https://yandex.com/indexnow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(indexNowPayload),
        }),
      ]);

      results.indexnow = {
        bing: { status: bingRes.status, ok: bingRes.ok },
        yandex: { status: yandexRes.status, ok: yandexRes.ok },
        urls_submitted: fullUrls.length,
      };

      // Consume response bodies
      await bingRes.text();
      await yandexRes.text();
    }

    // 2. Sitemap ping — Google + Bing
    if (pingSitemap) {
      const sitemapUrl = encodeURIComponent(`${DOMAIN}/sitemap.xml`);

      const [googlePing, bingPing] = await Promise.all([
        fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`),
        fetch(`https://www.bing.com/ping?sitemap=${sitemapUrl}`),
      ]);

      results.sitemap_ping = {
        google: { status: googlePing.status, ok: googlePing.ok },
        bing: { status: bingPing.status, ok: bingPing.ok },
      };

      await googlePing.text();
      await bingPing.text();
    }

    // 3. Log to growth_log
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase.from('growth_log').insert({
        action_type: 'notify-search-engines',
        details: results,
      });
    }

    console.log('✅ Search engines notified:', JSON.stringify(results));
    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Notify error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
