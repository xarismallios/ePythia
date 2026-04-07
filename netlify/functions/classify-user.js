// netlify/functions/classify-user.js
// Classifies a free-text chat message into one of the e-Pythia user categories.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { message } = body;
  if (!message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing message' }) };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing OPENAI_API_KEY' }) };
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 20,
      messages: [
        {
          role: 'system',
          content: `You are a classifier for a Greek career counseling app called e-Pythia.
Read the user's message and respond with ONLY one of these exact words:
- highschool  (student in high school / λύκειο / ΕΠΑΛ)
- university  (university student, recent graduate, or first job seeker)
- employee    (working professional, career change, freelancer)

Respond with exactly one word, no punctuation.`,
        },
        { role: 'user', content: message },
      ],
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('OpenAI classify error:', data);
    return { statusCode: 500, body: JSON.stringify({ error: 'Classification failed' }) };
  }

  const raw = (data.choices?.[0]?.message?.content || '').trim().toLowerCase();
  const valid = ['highschool', 'university', 'employee'];
  const userType = valid.includes(raw) ? raw : 'university';

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userType }),
  };
};
