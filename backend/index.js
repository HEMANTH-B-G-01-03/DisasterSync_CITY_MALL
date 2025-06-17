const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const supabase = require('./supabase');
const winston = require('winston');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

// WebSocket events
io.on('connection', (socket) => {
  logger.info('Client connected');
  socket.on('disconnect', () => logger.info('Client disconnected'));
});

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  req.user = { id: 'netrunnerX', role: 'admin' }; // Mock user
  next();
};
app.use(mockAuth);

// Basic route
app.get('/', (req, res) => res.send('DisasterSync Backend'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = { app, io, logger };

const disasterRoutes = require('./routes/disasters');
app.use('/disasters', disasterRoutes);


const geocodeRoutes = require('./routes/geocode');
app.use('/geocode', geocodeRoutes);

const socialMediaRoutes = require('./routes/social-media');
app.use('/disasters', socialMediaRoutes);