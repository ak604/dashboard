const otpService = require("../services/otpService");
const userService = require("../services/userService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const appService = require('../services/appService');
const authService = require('../services/authService');
const logger = require('../utils/logger');

const sendLoginOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const user = await userService.getUserByPhone(phoneNumber);

    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = otpService.generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;

   // await otpService.sendOTP(user.phoneNumber, otp);
    console.log("otp :", otp)
    await userService.updateUser(user);
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const verifyLoginOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const user = await userService.getUserByPhone(phoneNumber);

    if (!user || user.otp !== otp || Date.now() > user.otpExpires)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    delete user.otp;
    delete user.otpExpires;

    const token = jwt.sign({ userId: user.userId, companyId : user.companyId }, process.env.JWT_SECRET, { expiresIn: "90d" });
    res.json({ token });Ō
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Verify Google token and return JWT
 */
const verifyGoogleToken = async (req, res) => {
    try {
        const { token, packageId } = req.body;
        
        // Verify Google token
        const googleUser = await authService.verifyGoogleToken(token);

        // Get or create user
        const user = await authService.getOrCreateUser(googleUser, packageId);

        // Generate JWT - No session needed
        const jwtToken = authService.generateJWTToken(user, packageId);

        // Return token to client
        res.json({
            success: true,
            data: {
                token: jwtToken,
                user: {
                    userId: user.userId,
                    name: user.name,
                    email: user.email,
                    picture: user.picture,
                    accessLevel: user.accessLevel
                }
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid Google token'
        });
    }
};

module.exports = { sendLoginOTP, verifyLoginOTP, verifyGoogleToken };
