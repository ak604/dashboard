const express = require("express");
const { generatePreSignedUrl, generateDownloadUrl } = require("../controllers/s3Controller");
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
 *       - in: query
 *         name: durationSeconds
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *         description: The duration of the audio file in seconds
 *     responses:
 *       200:
 *         description: Successfully generated presigned URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadURL:
 *                   type: string
 *                   description: The presigned URL for uploading a file
 *                 fileName:
 *                   type: string
 *                   description: The name of the file
 *       400:
 *         description: Bad request if parameters are missing
 *       500:
 *         description: Server error
 */
router.get("/generate-presigned-url", authenticateJWT, generatePreSignedUrl);

/**
 * @swagger
 * /s3/download/{callId}:
 *   get:
 *     summary: Generate a presigned URL for downloading an audio file
 *     description: Returns a presigned URL to download an audio file from S3.
 *     tags: [s3]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: callId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the call whose audio file should be downloaded
 *     responses:
 *       200:
 *         description: Successfully generated download URL
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
 *                     downloadURL:
 *                       type: string
 *                       description: The presigned URL for downloading the file
 *                     fileName:
 *                       type: string
 *                       description: The name of the file
 *                     fileType:
 *                       type: string
 *                       description: The MIME type of the file
 *                     callId:
 *                       type: string
 *                       description: The ID of the call
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to access this file
 *       404:
 *         description: Call or audio file not found
 *       500:
 *         description: Server error
 */
router.get("/download/:callId", authenticateJWT, generateDownloadUrl);

module.exports = router;
