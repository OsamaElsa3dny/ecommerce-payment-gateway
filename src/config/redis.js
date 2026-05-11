const Redis = require('ioredis');
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

module.exports = { redisClient };