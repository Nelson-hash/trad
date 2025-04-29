const axios = require('axios');

exports.handler = async function(event, context) {
  // Only allow POST yes
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    // Parse request body
    const { text } = JSON.parse(event.body);
    
    if (!text) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Text is required' }) 
      };
    }

    // Make API request to Google Translate API
    const response = await axios.post('https://translation.googleapis.com/language/translate/v2', null, {
      params: {
        q: text,
        source: 'fr',
        target: 'en',
        format: 'text',
        key: process.env.GOOGLE_TRANSLATE_API_KEY
      }
    });

    // Return the translated text
    return {
      statusCode: 200,
      body: JSON.stringify({
        translatedText: response.data.data.translations[0].translatedText
      })
    };
  } catch (error) {
    // Fallback to LibreTranslate if Google fails
    try {
      const response = await axios.post('https://libretranslate.de/translate', {
        q: JSON.parse(event.body).text,
        source: 'fr',
        target: 'en',
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          translatedText: response.data.translatedText
        })
      };
    } catch (fallbackError) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ 
          error: 'Translation failed',
          details: fallbackError.message
        }) 
      };
    }
  }
};
