const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const authenticateJWT = require('../middlewares/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Reward:
 *       type: object
 *       required:
 *         - contextId
 *         - rewardId
 *       properties:
 *         contextId:
 *           type: string
 *           description: The app/context ID
 *         rewardId:
 *           type: string
 *           description: Unique identifier for the reward (provided by client)
 *         rewards:
 *           type: array
 *           description: List of token rewards
 *           items:
 *             type: object
 *             properties:
 *               tokenName:
 *                 type: string
 *                 description: Name of the token
 *               tokenAmount:
 *                 type: number
 *                 description: Amount of tokens to reward
 *         active:
 *           type: boolean
 *           description: Whether the reward is active
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         contextId: "app_123"
 *         rewardId: "daily_login"
 *         rewards:
 *           - tokenName: "gold"
 *             tokenAmount: 10
 *           - tokenName: "gems"
 *             tokenAmount: 5
 *         active: true
 *         createdAt: "2023-10-01T12:00:00.000Z"
 *         updatedAt: "2023-10-01T12:00:00.000Z"
 */

/**
 * @swagger
 * /rewards/{contextId}:
 *   post:
 *     summary: Create a new reward
 *     tags: [Rewards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contextId
 *         required: true
 *         schema:
 *           type: string
 *         description: App/Context ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rewardId
 *             properties:
 *               rewardId:
 *                 type: string
 *                 description: Reward identifier (set by client)
 *               rewards:
 *                 type: array
 *                 description: List of token rewards
 *                 items:
 *                   type: object
 *                   required:
 *                     - tokenName
 *                     - tokenAmount
 *                   properties:
 *                     tokenName:
 *                       type: string
 *                     tokenAmount:
 *                       type: number
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Reward created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Reward'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:contextId', authenticateJWT, rewardController.createReward);

/**
 * @swagger
 * /rewards/{contextId}/{rewardId}:
 *   get:
 *     summary: Get a reward by ID
 *     tags: [Rewards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contextId
 *         required: true
 *         schema:
 *           type: string
 *         description: App/Context ID
 *       - in: path
 *         name: rewardId
 *         required: true
 *         schema:
 *           type: string
 *         description: Reward ID
 *     responses:
 *       200:
 *         description: Reward retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Reward'
 *       404:
 *         description: Reward not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:contextId/:rewardId', authenticateJWT, rewardController.getReward);

/**
 * @swagger
 * /rewards/{contextId}:
 *   get:
 *     summary: Get all rewards for a context
 *     tags: [Rewards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contextId
 *         required: true
 *         schema:
 *           type: string
 *         description: App/Context ID
 *     responses:
 *       200:
 *         description: Rewards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reward'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:contextId', authenticateJWT, rewardController.getRewards);

/**
 * @swagger
 * /rewards/{contextId}/{rewardId}:
 *   put:
 *     summary: Update a reward
 *     tags: [Rewards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contextId
 *         required: true
 *         schema:
 *           type: string
 *         description: App/Context ID
 *       - in: path
 *         name: rewardId
 *         required: true
 *         schema:
 *           type: string
 *         description: Reward ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rewards:
 *                 type: array
 *                 description: List of token rewards
 *                 items:
 *                   type: object
 *                   required:
 *                     - tokenName
 *                     - tokenAmount
 *                   properties:
 *                     tokenName:
 *                       type: string
 *                     tokenAmount:
 *                       type: number
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Reward updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Reward'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Reward not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:contextId/:rewardId', authenticateJWT, rewardController.updateReward);

/**
 * @swagger
 * /rewards/{contextId}/{rewardId}:
 *   delete:
 *     summary: Delete a reward
 *     tags: [Rewards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contextId
 *         required: true
 *         schema:
 *           type: string
 *         description: App/Context ID
 *       - in: path
 *         name: rewardId
 *         required: true
 *         schema:
 *           type: string
 *         description: Reward ID
 *     responses:
 *       200:
 *         description: Reward deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Reward'
 *                 message:
 *                   type: string
 *                   example: Reward deleted successfully
 *       404:
 *         description: Reward not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:contextId/:rewardId', authenticateJWT, rewardController.deleteReward);

module.exports = router; 