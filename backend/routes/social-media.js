const express = require('express');
const supabase = require('../supabase');
const { io, logger } = require('../index');
const router = express.Router();

// GET /disasters/:id/social-media
router.get('/:id/social-media', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `social-media:${id}`;
    const { data: cacheData } = await supabase
      .from('cache')
      .select('value, expires_at')
      .eq('key', cacheKey)
      .single();
    if (cacheData && new Date(cacheData.expires_at) > new Date()) {
      logger.info(`Cache hit for social media: ${id}`);
      return res.json(cacheData.value);
    }

    // Mock Twitter API response
    const mockData = [
      { post: "#floodrelief Need food in NYC", user: "citizen1" }
    ];

    await supabase.from('cache').upsert({
      key: cacheKey,
      value: mockData,
      expires_at: new Date(Date.now() + 3600000)
    });

    io.emit('social_media_updated', { disaster_id: id, data: mockData });
    logger.info(`Social media fetched for disaster: ${id}`);
    res.json(mockData);
  } catch (error) {
    logger.error(`Social media error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch social media' });
  }
});

module.exports = router;