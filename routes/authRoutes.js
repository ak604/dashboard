const express = require("express");
const { sendLoginOTP, verifyLoginOTP } = require("../controllers/authController");

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

module.exports = router;
