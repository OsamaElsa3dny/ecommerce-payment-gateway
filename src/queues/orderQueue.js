const { Queue } = require('bullmq');
const { redisClient } = require('../config/redis');

const orderQueue = new Queue('order-processor', {
  connection: redisClient,
});

module.exports = { orderQueue };