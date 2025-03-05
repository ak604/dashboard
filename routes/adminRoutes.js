const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateJWT = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/adminMiddleware');

/**
 * @swagger
 * /admin/users/{contextId}/{userId}/wallet:
 *   get:
 *     summary: Get user wallet
 *     description: Admin endpoint to get a user's wallet
 *     tags:
 *       - admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contextId
 *         required: true
 *         schema:
 *           type: string
 *         description: Context ID (app or company)
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User wallet retrieved successfully
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
 *                     userId:
 *                       type: string
 *                     contextId:
 *                       type: string
 *                     wallet:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *                       example:
 *                         gold: 100
 *                         silver: 200
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin privileges
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/users/:contextId/:userId/wallet', authenticateJWT, isAdmin, adminController.getUserWallet);

/**
 * @swagger
 * /admin/users/{contextId}/{userId}/wallet:
 *   put:
 *     summary: Update user wallet
 *     description: Admin endpoint to update a user's wallet
 *     tags:
 *       - admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contextId
 *         required: true
 *         schema:
 *           type: string
 *         description: Context ID (app or company)
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wallet
 *             properties:
 *               wallet:
 *                 type: object
 *                 description: Map of token names to amounts
 *                 additionalProperties:
 *                   type: number
 *                 example:
 *                   gold: 100
 *                   silver: 200
 *               mode:
 *                 type: string
 *                 description: Update mode - 'merge' (add/subtract from existing wallet) or 'replace' (replace entire wallet)
 *                 enum: [merge, replace]
 *                 default: merge
 *     responses:
 *       200:
 *         description: Wallet updated successfully
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
 *                     userId:
 *                       type: string
 *                     contextId:
 *                       type: string
 *                     previous:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *                     current:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *                     mode:
 *                       type: string
 *                       enum: [merge, replace]
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin privileges
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/users/:contextId/:userId/wallet', authenticateJWT, isAdmin, adminController.updateUserWallet);

module.exports = router; 