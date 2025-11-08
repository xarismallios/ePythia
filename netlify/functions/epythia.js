// netlify/functions/epythia.js
import fetch from 'node-fetch';

export async function handler(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const prompt = body.prompt;

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing prompt' }),
      };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.7,
        max_tokens: 1500,
        messages: [
          {
            role: 'system',
            content:
              'You are e-Pythia, an AI career mentor. Be clear, structured, practical and encouraging.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI error:', data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data }),
      };
    }

    const message = data.choices?.[0]?.message?.content || 'No response generated';

    return {
      statusCode: 200,
      body: JSON.stringify({ message }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
}
