const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const supabase = require('../supabase');
const { logger } = require('../index');
const router = express.Router();

// GET /disasters/:id/official-updates
router.get('/:id/official-updates', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `updates:${id}`;
    const { data: cacheData } = await supabase
      .from('cache')
      .select('value, expires_at')
      .eq('key', cacheKey)
      .single();
    if (cacheData && new Date(cacheData.expires_at) > new Date()) {
      logger.info(`Cache hit for updates: ${id}`);
      return res.json(cacheData.value);
    }

    // Scrape FEMA website (example)
    const response = await axios.get('https://www.fema.gov');
    const $ = cheerio.load(response.data);
    const updates = $('article').map((i, el) => ({
      title: $(el).find('h2').text(),
      link: $(el).find('a').attr('href')
    })).get();

    await supabase.from('cache').upsert({
      key: cacheKey,
      value: updates,
      expires_at: new Date(Date.now() + 3600000)
    });

    logger.info(`Official updates fetched for disaster: ${id}`);
    res.json(updates);
  } catch (error) {
    logger.error(`Updates error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

module.exports = router;