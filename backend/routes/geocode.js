const express = require('express');
const axios = require('axios');
const supabase = require('../supabase');
const { logger } = require('../index');
const router = express.Router();

// POST /geocode
router.post('/', async (req, res) => {
  try {
    const { description } = req.body;

    // Check cache
    const cacheKey = `geocode:${description}`;
    const { data: cacheData } = await supabase
      .from('cache')
      .select('value, expires_at')
      .eq('key', cacheKey)
      .single();
    if (cacheData && new Date(cacheData.expires_at) > new Date()) {
      logger.info(`Cache hit for geocode: ${description}`);
      return res.json(cacheData.value);
    }

    // Gemini API for location extraction
    const geminiResponse = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [{ parts: [{ text: `Extract location from: ${description}` }] }]
      },
      { headers: { 'Authorization': `Bearer ${process.env.GEMINI_API_KEY}` } }
    );
    const locationName = geminiResponse.data.candidates[0].content.parts[0].text;

    // Mapbox Geocoding
    const mapboxResponse = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName)}.json`,
      { params: { access_token: process.env.MAPBOX_TOKEN } }
    );
    const [lon, lat] = mapboxResponse.data.features[0].center;
    const result = { location_name: locationName, lat, lon };

    // Cache result
    await supabase.from('cache').upsert({
      key: cacheKey,
      value: result,
      expires_at: new Date(Date.now() + 3600000) // 1 hour TTL
    });

    logger.info(`Geocoded: ${locationName} to ${lat}, ${lon}`);
    res.json(result);
  } catch (error) {
    logger.error(`Geocoding error: ${error.message}`);
    res.status(500).json({ error: 'Failed to geocode' });
  }
});

module.exports = router;