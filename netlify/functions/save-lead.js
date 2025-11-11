const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const { firstName, lastName, email, userType, sector, highschoolType, results } = JSON.parse(event.body);

    // Determine sector_or_type
    let sectorOrType = '';
    if (userType === 'employee') {
      sectorOrType = sector; // 'public' or 'private'
    } else if (userType === 'highschool') {
      sectorOrType = highschoolType; // 'epal' or 'general'
    }

    // Insert into Supabase
    const { data, error } = await supabase.from('leads').insert([
      {
        first_name: firstName,
        last_name: lastName,
        email: email,
        user_type: userType,
        sector_or_type: sectorOrType,
        results: results,
        contact_method: 'web'
      }
    ]);

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: error.message })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
