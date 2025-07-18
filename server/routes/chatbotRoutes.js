const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Public routes (no authentication required for basic chatbot)
router.post('/chat', chatbotController.processChatMessage);
router.get('/suggestions', chatbotController.getQuickSuggestions);

module.exports = router; 