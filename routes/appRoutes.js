const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authMiddleware');
const appController = require('../controllers/appController');

/**
 * @swagger
 * /apps:
 *   post:
 *     summary: Create a new app
 *     tags: [apps]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appId
 *               - name
 *             properties:
 *               appId:
 *                 type: string
 *                 description: The package ID or bundle ID of the app
 *               name:
 *                 type: string
 *                 description: The name of the app
 *               description:
 *                 type: string
 *                 description: Optional description of the app
 *     responses:
 *       201:
 *         description: App created successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.post('/', authenticateJWT, appController.createApp);

/**
 * @swagger
 * /apps/{appId}:
 *   get:
 *     summary: Get app details
 *     tags: [apps]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the app to retrieve
 *     responses:
 *       200:
 *         description: App details retrieved successfully
 *       404:
 *         description: App not found
 *       500:
 *         description: Server error
 */
router.get('/:appId', authenticateJWT, appController.getApp);

/**
 * @swagger
 * /apps/{appId}/costs:
 *   put:
 *     summary: Update app costs configuration
 *     description: Updates the costs configuration for various tasks in the app
 *     tags: [apps]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *         description: App ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               costs:
 *                 type: object
 *                 additionalProperties:
 *                   type: object
 *                   required:
 *                     - tokenName
 *                     - costThresholdValues
 *                   properties:
 *                     tokenName:
 *                       type: string
 *                       example: "gold"
 *                     costThresholdValues:
 *                       type: array
 *                       items:
 *                         type: array
 *                         items:
 *                           type: number
 *                         minItems: 2
 *                         maxItems: 2
 *                       example: [[5, 1], [10, 2], [20, 4]]
 *     responses:
 *       200:
 *         description: Costs configuration updated successfully
 *       400:
 *         description: Invalid costs configuration
 *       404:
 *         description: App not found
 *       500:
 *         description: Server error
 */
router.put('/:appId/costs', authenticateJWT, appController.updateAppCosts);

module.exports = router; 