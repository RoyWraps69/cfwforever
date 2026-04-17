// Netlify Function: translates Netlify form webhook → Supabase lead-intake
// Deployed at: /.netlify/functions/form-to-supabase

const SUPABASE_FN = 'https://vqjrldzmthbkayjzatnl.supabase.co/functions/v1/lead-intake'

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  try {
    const payload = JSON.parse(event.body)
    const data = payload.data || {}

    // Map Netlify form fields → lead-intake schema
    const lead = {
      action: 'new_lead',
      customer_name: [data['first-name'], data['last-name']].filter(Boolean).join(' ') || data['name'] || 'Unknown',
      customer_email: data['email'] || '',
      phone: data['phone'] || null,
      vehicle_type: data['vehicle-type'] || null,
      fleet_size: parseFleetSize(data['fleet-size']),
      message: [
        data['notes'] ? `Notes: ${data['notes']}` : '',
        data['wrap-type'] ? `Wrap type: ${data['wrap-type']}` : '',
        data['artwork'] ? `Artwork: ${data['artwork']}` : '',
        data['timeline'] ? `Timeline: ${data['timeline']}` : '',
        data['company'] ? `Company: ${data['company']}` : '',
        data['free-pickup'] === 'yes' ? 'Interested in free pickup.' : '',
      ].filter(Boolean).join(' | ') || null,
      source: 'website',
    }

    const r = await fetch(SUPABASE_FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    })

    const result = await r.json()
    console.log('Lead created:', result)

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, job_id: result.job_id }),
    }
  } catch (err) {
    console.error('form-to-supabase error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}

function parseFleetSize(val) {
  if (!val) return 1
  if (val === '1') return 1
  if (val === '2-4') return 3
  if (val === '5-9') return 7
  if (val === '10-24') return 15
  if (val === '25+') return 25
  const n = parseInt(val)
  return isNaN(n) ? 1 : n
}
