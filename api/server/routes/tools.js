const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const { generateAISuggestions } = require('~/server/controllers/tools');

const router = express.Router();

/**
 * Test endpoint to verify routes are working
 * @route GET /api/tools/test
 * @returns {object} 200 - application/json
 */
router.get('/test', (req, res) => {
  res.json({ message: 'Tools route is working!' });
});

/**
 * Generate AI-powered follow-up suggestions
 * @route POST /api/tools/ai-suggestions
 * @param {string} userQuestion - The user's original question
 * @returns {object} 200 - application/json
 */
router.post('/ai-suggestions', requireJwtAuth, generateAISuggestions);

/**
 * Test endpoint for AI suggestions (no auth required for testing)
 * @route POST /api/tools/test-suggestions
 * @param {string} userQuestion - The user's original question
 * @returns {object} 200 - application/json
 */
router.post('/test-suggestions', generateAISuggestions);

module.exports = router;