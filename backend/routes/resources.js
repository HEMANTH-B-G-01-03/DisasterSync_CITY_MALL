const express = require('express');
const supabase = require('../supabase');
const { io, logger } = require('../index');
const router = express.Router();

// GET /disasters/:id/resources?lat=<lat>&lon=<lon>
router.get('/:id/resources', async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lon } = req.query;
    const { data, error } = await supabase
      .rpc('nearby_resources', {
        disaster_id: id,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        distance: 10000 // 10km
      });
    if (error) throw error;
    io.emit('resources_updated', { disaster_id: id, data });
    logger.info(`Resources fetched for disaster: ${id}`);
    res.json(data);
  } catch (error) {
    logger.error(`Resources error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

module.exports = router;