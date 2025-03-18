const express = require('express');
const router = express.Router();
const walletTransactionController = require('../controllers/walletTransactionController');
const authenticateJWT = require('../middlewares/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     WalletTransaction:
 *       type: object
 *       properties:
 *         contextUserId:
 *           type: string
 *           description: Composite key combining contextId and userId
 *         epochTime:
 *           type: number
 *           description: Transaction timestamp in milliseconds since Unix epoch
 *         contextId:
 *           type: string
 *           description: The app/context ID
 *         userId:
 *           type: string
 *           description: User ID
 *         type:
 *           type: string
 *           enum: [credit, debit]
 *           description: Transaction type
 *         tokenName:
 *           type: string
 *           description: Name of the token
 *         tokenAmount:
 *           type: number
 *           description: Amount of tokens
 *         description:
 *           type: string
 *           description: Transaction description
 *         metadata:
 *           type: object
 *           description: Additional transaction metadata
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 */

/**
 * @swagger
 * /wallet-transactions/{contextId}:
 *   get:
 *     summary: Get user's wallet transactions
 *     description: Returns the user's wallet transaction history
 *     tags: [wallet]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contextId
 *         required: true
 *         schema:
 *           type: string
 *         description: App/Context ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of transactions to return
 *       - in: query
 *         name: startTime
 *         schema:
 *           type: integer
 *         description: Epoch time to start from (for pagination)
 *     responses:
 *       200:
 *         description: Wallet transactions retrieved successfully
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
 *                     $ref: '#/components/schemas/WalletTransaction'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     lastEvaluatedKey:
 *                       type: object
 *                       description: Last evaluated key for pagination
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:contextId', authenticateJWT, walletTransactionController.getUserTransactions);

module.exports = router; 