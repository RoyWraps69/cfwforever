import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Target pages/topics to expand FAQs for
const FAQ_TARGETS = [
  { slug: 'commercial', topic: 'commercial vehicle wraps Chicago' },
  { slug: 'fleet-wraps-chicago', topic: 'fleet wraps for businesses in Chicago' },
  { slug: 'truck-wraps-chicago', topic: 'truck wraps and graphics Chicago' },
  { slug: 'van-wraps-chicago', topic: 'van wraps for contractors Chicago' },
  { slug: 'colorchange', topic: 'color change vehicle wraps Chicago' },
  { slug: 'boxtruck', topic: 'box truck wraps for delivery companies' },
  { slug: 'sprinter', topic: 'sprinter van wraps for businesses' },
  { slug: 'hvac', topic: 'HVAC van and truck wraps' },
  { slug: 'plumber', topic: 'plumbing van wraps and vehicle branding' },
  { slug: 'electrician-vehicle-wraps-chicago', topic: 'electrician vehicle wraps' },
  { slug: 'food-truck-wraps-chicago', topic: 'food truck wraps and graphics' },
  { slug: 'boat-wraps-chicago', topic: 'boat wraps and marine graphics' },
  { slug: 'partial-wraps', topic: 'partial vehicle wraps vs full wraps' },
  { slug: 'wrap-removal', topic: 'vehicle wrap removal process' },
  { slug: 'vinyl-guide', topic: 'vehicle wrap vinyl types and materials' },
  { slug: 'vehicle-wrap-cost-chicago', topic: 'vehicle wrap cost and pricing' },
  { slug: 'ev-wraps', topic: 'electric vehicle wraps Tesla Rivian' },
  { slug: 'contractor', topic: 'contractor vehicle wraps branding' },
  { slug: 'delivery', topic: 'delivery fleet vehicle wraps' },
  { slug: 'landscape', topic: 'landscaping truck wraps' },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing config');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Pick a random target page
    const target = FAQ_TARGETS[Math.floor(Math.random() * FAQ_TARGETS.length)];

    // Get existing FAQs for this page to avoid duplicates
    const { data: existingFaqs } = await supabase
      .from('faq_entries')
      .select('question')
      .eq('page_slug', target.slug);

    const existingQuestions = (existingFaqs || []).map(f => f.question.toLowerCase());

    console.log(`Generating FAQs for: ${target.slug} (${existingQuestions.length} existing)`);

    // Use Lovable AI to generate new FAQs
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'system',
          content: 'You are an SEO expert for Chicago Fleet Wraps, a vehicle wrap company. Generate FAQ entries optimized for Google\'s "People Also Ask" feature and AI answer engines.'
        }, {
          role: 'user',
          content: `Generate 5 NEW frequently asked questions about "${target.topic}" for Chicago Fleet Wraps.

COMPANY: Chicago Fleet Wraps, Chicago IL | (312) 597-1286 | 24+ years, 9,400+ vehicles
Materials: Avery Dennison MPI 1105, 3M IJ180-CV3 | 2-year warranty

EXISTING QUESTIONS TO AVOID (don't repeat these):
${existingQuestions.map(q => '- ' + q).join('\n') || '- none yet'}

REQUIREMENTS:
- Questions should match "People Also Ask" phrasing (natural voice search queries)
- Answers should be 2-4 sentences, factual, quotable by AI engines
- Include Chicago-specific references where relevant
- Include specific numbers/data where possible
- Make answers start with a direct statement (good for featured snippets)

Return ONLY a JSON array: [{"q": "Question?", "a": "Answer text"}]
No markdown fences. No explanation.`
        }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI gateway error:', response.status, errText);
      if (response.status === 429) return new Response(JSON.stringify({ error: 'Rate limited' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (response.status === 402) return new Response(JSON.stringify({ error: 'Credits exhausted' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      throw new Error(`AI error: ${response.status}`);
    }

    const aiResult = await response.json();
    let content = aiResult.choices?.[0]?.message?.content || '';
    if (content.startsWith('```')) content = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

    const faqs = JSON.parse(content);

    // Filter out duplicates
    const newFaqs = faqs.filter((f: any) =>
      !existingQuestions.includes(f.q.toLowerCase())
    );

    if (newFaqs.length === 0) {
      return new Response(JSON.stringify({ message: 'No new unique FAQs generated', slug: target.slug }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Insert new FAQs
    const rows = newFaqs.map((f: any) => ({
      page_slug: target.slug,
      question: f.q,
      answer: f.a,
      source: 'ai-generated',
    }));

    const { error: insertErr } = await supabase.from('faq_entries').insert(rows);
    if (insertErr) throw new Error(`Insert failed: ${insertErr.message}`);

    await supabase.from('growth_log').insert({
      action_type: 'faqs-generated',
      details: { slug: target.slug, count: newFaqs.length, questions: newFaqs.map((f: any) => f.q) },
    });

    console.log(`✅ ${newFaqs.length} FAQs added for ${target.slug}`);
    return new Response(JSON.stringify({ success: true, slug: target.slug, added: newFaqs.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('FAQ generation error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
