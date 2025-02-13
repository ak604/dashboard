const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middlewares/authMiddleware");
const companyController = require('../controllers/companyController');
/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Create a new company
 *     description: Registers a new real estate company.
 *     tags: [companies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "c1"
 *               phoneNumber:
 *                 type: string
 *                 example: "+919620475351"
 *               email:
 *                 type: string
 *                 example: "c1@c1.com"
 *               industry:
 *                 type: string
 *                 example: "real estate"
 *     responses:
 *       201:
 *         description: Company created successfully
 */
router.post('/', companyController.createCompany);

/**
 * @swagger
 * /companies/{companyId}:
 *   get:
 *     summary: Get company details
 *     description: Fetch details of a specific company.
 *     tags: [companies]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company details returned
 */
router.get('/:companyId', authenticateJWT, companyController.getCompany);


module.exports = router;
