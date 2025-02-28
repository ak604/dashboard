const express = require("express");
const { sendLoginOTP, verifyLoginOTP, verifyGoogleToken } = require("../controllers/authController");
const jwt = require('jsonwebtoken');

const router = express.Router();

/**
 * @swagger
 * /auth/sendOtp:
 *   post:
 *     summary: Send OTP to user's phone
 *     description: Sends the generated OTP via AWS SES.
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+919620475359"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       500:
 *         description: Error sending OTP
 */
router.post("/sendOtp", sendLoginOTP);

/**
 * @swagger
 * /auth/verifyOtp:
 *   post:
 *     summary: Verify OTP and issue JWT
 *     description: Checks the OTP and generates a JWT token if valid.
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+919620475359"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified, JWT issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid OTP or expired
 *       500:
 *         description: Error verifying OTP
 */
router.post("/verifyOtp", verifyLoginOTP);

/**
 * @swagger
 * /auth/google/verify:
 *   post:
 *     summary: Verify Google OAuth token and return JWT
 *     description: Verifies a Google OAuth token and returns a JWT token for API authentication
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - packageId
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google OAuth ID token
 *               packageId:
 *                 type: string
 *                 description: Android app package ID or iOS bundle ID
 *     responses:
 *       200:
 *         description: Successfully verified and authenticated
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
 *                     token:
 *                       type: string
 *                       description: JWT token for API authentication
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
 *                         accessLevel:
 *                           type: string
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Invalid Google token
 *       404:
 *         description: App not found
 *       500:
 *         description: Server error
 */
router.post('/google/verify', verifyGoogleToken);

module.exports = router;
