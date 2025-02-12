const { generateOTP, sendOTP } = require("../services/otpService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const sendLoginOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await getUserByEmail(email);

    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;

    await createUser(user);
    await sendOTP(user.phoneNumber, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await getUserByEmail(email);

    if (!user || user.otp !== otp || Date.now() > user.otpExpires)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    delete user.otp;
    delete user.otpExpires;
    await createUser(user);

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { sendLoginOTP, verifyLoginOTP };
