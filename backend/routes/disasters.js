const express = require('express');
const supabase = require('../supabase');
const { io, logger } = require('../index');
const router = express.Router();

// POST /disasters
router.post('/', async (req, res) => {
  try {
    const { title, location_name, description, tags } = req.body;
    const { data, error } = await supabase
      .from('disasters')
      .insert([{
        title,
        location_name,
        description,
        tags,
        owner_id: req.user.id,
        audit_trail: [{
          action: 'create',
          user_id: req.user.id,
          timestamp: new Date().toISOString()
        }]
      }])
      .select();
    if (error) throw error;
    io.emit('disaster_updated', data[0]);
    logger.info(`Disaster created: ${title}`);
    res.status(201).json(data[0]);
  } catch (error) {
    logger.error(`Error creating disaster: ${error.message}`);
    res.status(500).json({ error: 'Failed to create disaster' });
  }
});

// GET /disasters?tag=<tag>
router.get('/', async (req, res) => {
  try {
    const { tag } = req.query;
    let query = supabase.from('disasters').select('*');
    if (tag) query = query.contains('tags', [tag]);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error(`Error fetching disasters: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch disasters' });
  }
});

// PUT /disasters/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, location_name, description, tags } = req.body;
    const { data, error } = await supabase
      .from('disasters')
      .update({
        title,
        location_name,
        description,
        tags,
        audit_trail: supabase.raw(`audit_trail || ${JSON.stringify([{
          action: 'update',
          user_id: req.user.id,
          timestamp: new Date().toISOString()
        }])}`)
      })
      .eq('id', id)
      .select();
    if (error) throw error;
    io.emit('disaster_updated', data[0]);
    logger.info(`Disaster updated: ${id}`);
    res.json(data[0]);
  } catch (error) {
    logger.error(`Error updating disaster: ${error.message}`);
    res.status(500).json({ error: 'Failed to update disaster' });
  }
});

// DELETE /disasters/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('disasters')
      .delete()
      .eq('id', id)
      .select();
    if (error) throw error;
    io.emit('disaster_updated', { id, deleted: true });
    logger.info(`Disaster deleted: ${id}`);
    res.json({ message: 'Disaster deleted' });
  } catch (error) {
    logger.error(`Error deleting disaster: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete disaster' });
  }
});

module.exports = router;