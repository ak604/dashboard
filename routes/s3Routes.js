const express = require("express");
const { generatePreSignedUrl } = require("../controllers/s3Controller");
const authenticateJWT = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /s3/generate-presigned-url:
 *   get:
 *     summary: Generate a presigned URL for S3 file upload
 *     description: Returns a presigned URL to upload a file to S3.
 *     parameters:
 *       - in: query
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the file to be uploaded
 *       - in: query
 *         name: fileType
 *         required: true
 *         schema:
 *           type: string
 *         description: The MIME type of the file (e.g., image/png, application/pdf)
 *     responses:
 *       200:
 *         description: Successfully generated presigned URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: The presigned URL for uploading a file
 *       400:
 *         description: Bad request if parameters are missing
 *       500:
 *         description: Server error
 */
router.get("/generate-presigned-url", authenticateJWT,generatePreSignedUrl);

module.exports = router;
