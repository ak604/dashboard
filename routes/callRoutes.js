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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of calls to return (1-100)
 *       - in: query
 *         name: nextToken
 *         schema:
 *           type: string
 *         description: Pagination token for next page of results
 *       - in: query
 *         name: include_download_urls
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether to include presigned download URLs for each call's audio file
 *     responses:
 *       200:
 *         description: Successfully retrieved calls
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       callId:
 *                         type: string
 *                       contextId:
 *                         type: string
 *                       fileName:
 *                         type: string
 *                       fileType:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       durationSeconds:
 *                         type: number
 *                       transcription:
 *                         type: string
 *                       templates:
 *                         type: object
 *                         additionalProperties: true
 *                       downloadURL:
 *                         type: string
 *                         description: Presigned URL for downloading the audio file (only included when include_download_urls=true)
 *                 nextToken:
 *                   type: string
 *                   description: Token for next page of results
 *                   example: "eyJ1c2VySWQiOiJ1c2VyMTIzIiwiY2FsbElkIjoiY2FsbDQ1NiJ9"
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Invalid or expired token
 *       404:
 *         description: Call not found
 *       500:
 *         description: Server error
 */
router.get('/', authenticateJWT, callController.getCalls);

/**
 * @swagger
 * /calls/{callId}/process:
 *   get:
 *     summary: Process call transcription with a template (long polling)
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
 *       - in: query
 *         name: pollInterval
 *         schema:
 *           type: integer
 *           default: 2000
 *         description: Polling interval in milliseconds (default 2000)
 *       - in: query
 *         name: timeout
 *         schema:
 *           type: integer
 *           default: 30000
 *         description: Maximum wait time in milliseconds (default 30000)
 *     responses:
 *       200:
 *         description: Updated call object with processing result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Call'
 *       408:
 *         description: Transcription not available within timeout period
 *       400:
 *         description: Missing parameters
 *       404:
 *         description: Call or template not found
 *       500:
 *         description: Processing error
 */
router.get('/:callId/process', authenticateJWT, callController.processCall);

/**
 * @swagger
 * /calls/{callId}:
 *   delete:
 *     summary: Delete a specific call
 *     description: Deletes a call by ID. Only the owner of the call can delete it.
 *     tags: [call]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: callId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the call to delete
 *     responses:
 *       200:
 *         description: Call deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Call deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     callId:
 *                       type: string
 *                       example: abc123
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Call not found
 *       500:
 *         description: Server error
 */
router.delete('/:callId', authenticateJWT, callController.deleteCall);

module.exports = router;
