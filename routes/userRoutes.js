const express = require("express");
const userController = require("../controllers/userController");
const authenticateJWT = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: add a new user
 *     description: add a new user.

 *     tags: [users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "username"
 *               email:
 *                 type: string
 *                 example: "useremail@company.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "+919620475359"
 *               designation:
 *                 type: string
 *                 example: "manager"
 *               accessLevel:
 *                 type: string
 *                 example: "USER"
 *               companyId:
 *                 type: string
 *                 example: "c1"
 *               supervisorId:
 *                 type: string
 *                 example: "c1"
 *     responses:
 *       200:
 *         description: User added successfully
 *       500:
 *         description: Error adding user
 */
router.post("/", userController.createUser);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get user details
 *     description: Fetch details of a specific user.
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: user details returned
 */
router.get('/:userId', authenticateJWT,userController.getUser);

module.exports = router;
