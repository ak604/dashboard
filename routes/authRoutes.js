const express = require("express");
const { sendLoginOTP, verifyLoginOTP } = require("../controllers/authController");

const router = express.Router();

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP to user's email
 *     description: Sends the generated OTP via AWS SES.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       500:
 *         description: Error sending OTP
 */
router.post("/login/otp", sendLoginOTP);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and issue JWT
 *     description: Checks the OTP and generates a JWT token if valid.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
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
router.post("/login/verify-otp", verifyLoginOTP);

module.exports = router;
