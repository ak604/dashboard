// routes/callRoutes.js
const express = require('express');
const callController = require('../controllers/callController');
const authenticateJWT = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /calls:
 *   get:
 *     summary: Get calls for a user
 *     description: Fetch all calls for a user or a specific call if callId is provided
 *     tags: [call]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *         example: "user123"
 *       - in: query
 *         name: callId
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional - Specific call ID to retrieve a single call
 *         example: "call456"
 *     responses:
 *       200:
 *         description: Successfully retrieved call(s)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   description: Single call object when callId is provided
 *                   properties:
 *                     callId:
 *                       type: string
 *                       example: "call456"
 *                     userId:
 *                       type: string
 *                       example: "user123"
 *                     companyId:
 *                       type: string
 *                       example: "company789"
 *                     fileName:
 *                       type: string
 *                       example: "user123/+1234567890/call456.wav"
 *                     fileType:
 *                       type: string
 *                       example: "audio/wav"
 *                     customerPhoneNumber:
 *                       type: string
 *                       example: "+1234567890"
 *                     transcription:
 *                       type: string
 *                       example: "This is the transcribed text of the call"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-20T10:30:00Z"
 *                 - type: array
 *                   description: Array of calls when no callId is provided
 *                   items:
 *                     type: object
 *                     properties:
 *                       callId:
 *                         type: string
 *                         example: "call456"
 *                       userId:
 *                         type: string
 *                         example: "user123"
 *                       companyId:
 *                         type: string
 *                         example: "company789"
 *                       fileName:
 *                         type: string
 *                         example: "user123/+1234567890/call456.wav"
 *                       fileType:
 *                         type: string
 *                         example: "audio/wav"
 *                       customerPhoneNumber:
 *                         type: string
 *                         example: "+1234567890"
 *                       transcription:
 *                         type: string
 *                         example: "This is the transcribed text of the call"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-20T10:30:00Z"
 *       400:
 *         description: Bad request - Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "userId is required"
 *       404:
 *         description: Call not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Call not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving calls"
 *                 error:
 *                   type: object
 */
router.get('/', authenticateJWT, callController.getCalls);

module.exports = router;
