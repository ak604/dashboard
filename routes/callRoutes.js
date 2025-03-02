// routes/callRoutes.js
const express = require('express');
const callController = require('../controllers/callController');
const authenticateJWT = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /calls:
 *   get:
 *     summary: Get calls for the authenticated user
 *     description: Fetch all calls for the authenticated user or a specific call if callId is provided
 *     tags: [call]
 *     security:
 *       - BearerAuth: []
 *     parameters:
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
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Authentication required"
 *       403:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or expired token"
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

/**
 * @swagger
 * /calls/{callId}/process:
 *   get:
 *     summary: Process call transcription with a template
 *     tags: [call]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: callId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: templateName
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: contextId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Processed result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     processingResult:
 *                       type: string
 *                     modelUsed:
 *                       type: string
 *                     tokensUsed:
 *                       type: object
 *                       properties:
 *                         prompt_tokens:
 *                           type: number
 *                         completion_tokens:
 *                           type: number
 *       400:
 *         description: Missing parameters or no transcription
 *       404:
 *         description: Call or template not found
 *       500:
 *         description: Processing error
 */
router.get('/:callId/process', authenticateJWT, callController.processCall);

module.exports = router;
