// routes/callRoutes.js
const express = require('express');
const callController = require('../controllers/callController');
const authenticateJWT = require("../middlewares/authMiddleware");
const router = express.Router();

router.post('/', authenticateJWT, callController.logCall);
router.get('/agent/:agentId', authenticateJWT, callController.getCallsByAgent);

module.exports = router;
