const express = require('express');
const axios = require('axios');
const supabase = require('../supabase');
const { logger } = require('../index');
const router = express.Router();

// POST /disasters/:id/verify-image
router.post('/:id/verify-image', async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url } = req.body;
    const cacheKey = `verify-image:${image_url}`;
    const { data: cacheData } = await supabase
      .from('cache')
      .select('value, expires_at')
      .eq('key', cacheKey)
      .single();
    if (cacheData && new Date(cacheData.expires_at) > new Date()) {
      logger.info(`Cache hit for image verification: ${image_url}`);
      return res.json(cacheData.value);
    }

    // Gemini API for image verification
    const geminiResponse = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent',
      {
        contents: [{ parts: [{ text: `Analyze image at ${image_url} for signs of manipulation or disaster context` }] }]
      },
      { headers: { 'Authorization': `Bearer ${process.env.GEMINI_API_KEY}` } }
    );
    const verification = geminiResponse.data.candidates[0].content.parts[0].text;

    await supabase.from('cache').upsert({
      key: cacheKey,
      value: { verification },
      expires_at: new Date(Date.now() + 3600000)
    });

    await supabase
      .from('reports')
      .update({ verification_status: verification })
      .eq('image_url', image_url);

    logger.info(`Image verified: ${image_url}`);
    res.json({ verification });
  } catch (error) {
    logger.error(`Image verification error: ${error.message}`);
    res.status(500).json({ error: 'Failed to verify image' });
  }
});

module.exports = router;