// routes/callRoutes.js
const express = require('express');
const callController = require('../controllers/callController');
const authenticateJWT = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /calls/{userId}:
 *   get:
 *     summary: Get company details
 *     description: Fetch calls of a specific user.
 *     tags: [calls]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: call details returned
 */
router.get('/:userId', authenticateJWT, callController.getCallsByUserId);

module.exports = router;
