// routes/callRoutes.js
const express = require('express');
const callController = require('../controllers/callController');

const router = express.Router();

router.post('/', callController.logCall);
router.get('/agent/:agentId', callController.getCallsByAgent);

module.exports = router;
