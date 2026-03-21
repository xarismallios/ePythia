// netlify/functions/send-results.js
// Requires RESEND_API_KEY env var in Netlify dashboard
// Sign up free at resend.com — verify your domain or use onboarding@resend.dev for testing

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'Email service not configured' }) };
  }

  try {
    const { firstName, email, persona, recommendations, actionSteps } = JSON.parse(event.body || '{}');

    if (!email || !firstName) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    const recHTML = (recommendations || '').split('\n').map(line => {
      if (line.startsWith('###')) return `<h3 style="color:#5b21b6;font-size:16px;font-weight:700;margin:20px 0 8px">${line.replace(/^###\s*/, '')}</h3>`;
      if (line.startsWith('-')) return `<p style="margin:4px 0 4px 16px;color:#374151;font-size:14px">• ${line.replace(/^-\s*/, '')}</p>`;
      if (line.startsWith('**') && line.endsWith('**')) return `<p style="color:#1e1b4b;font-weight:700;font-size:14px;margin:8px 0">${line.replace(/\*\*/g, '')}</p>`;
      return line.trim() ? `<p style="color:#374151;font-size:14px;line-height:1.7;margin:4px 0">${line}</p>` : '<br>';
    }).join('');

    const stepsHTML = (actionSteps || []).map((s, i) =>
      `<div style="padding:10px 0;border-bottom:1px solid #dcfce7;font-size:14px;color:#166534"><strong style="color:#6d28d9">Βήμα ${i + 1}.</strong> ${s}</div>`
    ).join('');

    const html = `<!DOCTYPE html>
<html lang="el">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f7ff;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,0.1)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#7c3aed,#06b6d4);padding:32px 40px">
      <h1 style="color:#fff;font-size:28px;font-weight:800;margin:0">e-Pythia</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:4px 0 0">AI Σύμβουλος Καριέρας</p>
    </div>

    <div style="padding:36px 40px">

      <!-- Greeting -->
      <p style="font-size:18px;font-weight:700;color:#1e1b4b;margin:0 0 4px">Γεια σου, ${firstName}!</p>
      <p style="color:#64748b;font-size:14px;margin:0 0 28px">Εδώ είναι ο χάρτης καριέρας σου από την e-Pythia.</p>

      ${persona ? `
      <!-- Persona -->
      <div style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-left:5px solid #7c3aed;border-radius:10px;padding:20px 24px;margin-bottom:28px">
        <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin:0 0 4px">Το Προφίλ σου</p>
        <p style="font-size:22px;font-weight:800;color:#5b21b6;margin:0 0 4px">${persona.name}</p>
        <p style="font-size:14px;color:#6d28d9;margin:0">${persona.tagline}</p>
      </div>` : ''}

      <!-- Career Map -->
      <h2 style="font-size:20px;font-weight:700;color:#1e1b4b;border-bottom:2px solid #ede9fe;padding-bottom:10px;margin:0 0 16px">Ο Χάρτης της Καριέρας σου</h2>
      ${recHTML}

      ${stepsHTML ? `
      <!-- Action Plan -->
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:24px;margin-top:28px">
        <h2 style="font-size:18px;font-weight:700;color:#166534;margin:0 0 16px">Το Σχέδιο Δράσης σου</h2>
        ${stepsHTML}
      </div>` : ''}

      <!-- CTA -->
      <div style="margin-top:32px;text-align:center;background:linear-gradient(135deg,#f5f3ff,#fdf4ff);border-radius:12px;padding:24px">
        <p style="font-size:14px;font-weight:700;color:#059669;margin:0 0 12px">✨ Η πρώτη αναγνωριστική συνεδρία είναι ΔΩΡΕΑΝ</p>
        <a href="https://calendly.com/pythiacontact/1-coaching-pythia-ai"
           style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:#fff;font-weight:700;font-size:16px;padding:14px 32px;border-radius:12px;text-decoration:none">
          Κλείσε Δωρεάν Συνεδρία →
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#f5f3ff;padding:16px 40px;display:flex;justify-content:space-between">
      <span style="font-size:12px;color:#7c3aed">epythia.netlify.app</span>
      <a href="mailto:pythiacontact@gmail.com" style="font-size:12px;color:#7c3aed;text-decoration:none">pythiacontact@gmail.com</a>
    </div>
  </div>
</body>
</html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'e-Pythia <onboarding@resend.dev>',
        to: email,
        subject: `${firstName}, ο χάρτης καριέρας σου από e-Pythia ${persona ? `— ${persona.name}` : ''}`,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Resend error:', data);
      return { statusCode: 400, headers, body: JSON.stringify({ error: data }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('send-results error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
