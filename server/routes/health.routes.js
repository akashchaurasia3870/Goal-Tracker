const express = require('express');
const mongoose = require('mongoose');
const ApiResponse = require('../utils/apiResponse');

const router = express.Router();

router.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  return ApiResponse.success(res, {
    status: 'healthy',
    service: 'TaskFlow API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: '1.0.0',
  }, 'TaskFlow API service is up and running');
});

module.exports = router;
