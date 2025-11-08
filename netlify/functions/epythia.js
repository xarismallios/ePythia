// netlify/functions/epythia.js

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid JSON body' }),
      };
    }

    const prompt = body.prompt;
    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing prompt' }),
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY is missing');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server config error: missing OPENAI_API_KEY' }),
      };
    }

    // Χρησιμοποιούμε το global fetch (ΔΕΝ κάνουμε import node-fetch)
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.7,
        max_tokens: 1500,
        messages: [
          {
            role: 'system',
            content: `
You are e-Pythia, an AI career mentor and strategist. Be clear, structured, practical and encouraging.
`.trim(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error('OpenAI error:', data);
      return {
        statusCode: openaiRes.status,
        body: JSON.stringify({ error: data }),
      };
    }

    const message =
      data.choices?.[0]?.message?.content || 'No response generated';

    return {
      statusCode: 200,
      body: JSON.stringify({ message }),
    };
  } catch (err) {
    console.error('Netlify function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
