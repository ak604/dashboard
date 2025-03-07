const express = require('express');
const router = express.Router();
const appLoadController = require('../controllers/appLoadController');
const authenticateJWT = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /app/load:
 *   get:
 *     summary: Load app initialization data
 *     description: Fetches user data and app data for the current app context
 *     tags: [app]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: App data loaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         picture:
 *                           type: string
 *                           description: Profile picture URL
 *                         accessLevel:
 *                           type: string
 *                           enum: [USER, ADMIN, MODERATOR]
 *                         wallet:
 *                           type: object
 *                           additionalProperties:
 *                             type: number
 *                           description: Map of token names to amounts
 *                           example:
 *                             gold: 100
 *                             silver: 200
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                     app:
 *                       type: object
 *                       properties:
 *                         appId:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         costs:
 *                           type: object
 *                           description: Cost configurations for different tasks
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Invalid request or authentication
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User or App not found
 *       500:
 *         description: Server error
 */
router.get('/load', authenticateJWT, appLoadController.loadAppData);

module.exports = router; 