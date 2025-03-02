const express = require('express');
const templateController = require('../controllers/templateController');
const authenticateJWT = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /templates:
 *   post:
 *     summary: Create a new template
 *     description: Create a new template for a specific context
 *     tags: [templates]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateName
 *               - systemContent
 *               - userContent
 *               - contextId
 *             properties:
 *               contextId:
 *                 type: string
 *                 description: ID of the context (app or company)
 *                 example: "app123"
 *               templateName:
 *                 type: string
 *                 description: Unique name for the template within this context
 *                 example: "customer-support"
 *               systemContent:
 *                 type: string
 *                 description: System instructions for the AI model
 *                 example: "You are a helpful customer support assistant."
 *               userContent:
 *                 type: string
 *                 description: User prompt template
 *                 example: "Help the customer with their issue: {{issue}}"
 *               model:
 *                 type: string
 *                 description: AI model to use
 *                 example: "gpt-4o"
 *                 default: "gpt-4o"
 *               temperature:
 *                 type: number
 *                 description: Temperature setting for the model (0.0-2.0)
 *                 example: 0.7
 *                 default: 0.7
 *               max_completion_tokens:
 *                 type: integer
 *                 description: Maximum tokens for completion
 *                 example: 1000
 *                 default: 1000
 *     responses:
 *       201:
 *         description: Template created successfully
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Template with this name already exists
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.post('/', authenticateJWT, templateController.createTemplate);

/**
 * @swagger
 * /templates:
 *   get:
 *     summary: List all templates for a context
 *     description: Retrieve all templates for a specific context
 *     tags: [templates]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: contextId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the context (app or company)
 *         example: "app123"
 *     responses:
 *       200:
 *         description: List of templates
 *       400:
 *         description: Missing contextId parameter
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get('/', authenticateJWT, templateController.listTemplates);

/**
 * @swagger
 * /templates/{templateName}:
 *   get:
 *     summary: Get a specific template
 *     description: Retrieve a template by name for a specific context
 *     tags: [templates]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the template to retrieve
 *         example: "customer-support"
 *       - in: query
 *         name: contextId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the context (app or company)
 *         example: "app123"
 *     responses:
 *       200:
 *         description: Template details
 *       400:
 *         description: Missing contextId parameter
 *       404:
 *         description: Template not found
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get('/:templateName', authenticateJWT, templateController.getTemplate);

/**
 * @swagger
 * /templates/{templateName}:
 *   put:
 *     summary: Update a template
 *     description: Update an existing template by name for a specific context
 *     tags: [templates]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the template to update
 *         example: "customer-support"
 *       - in: query
 *         name: contextId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the context (app or company)
 *         example: "app123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               systemContent:
 *                 type: string
 *                 description: System instructions for the AI model
 *                 example: "You are a very helpful customer support assistant."
 *               userContent:
 *                 type: string
 *                 description: User prompt template
 *                 example: "Please help the customer with: {{issue}}"
 *               model:
 *                 type: string
 *                 description: AI model to use
 *                 example: "gpt-4o-mini"
 *               temperature:
 *                 type: number
 *                 description: Temperature setting for the model (0.0-2.0)
 *                 example: 0.8
 *               max_completion_tokens:
 *                 type: integer
 *                 description: Maximum tokens for completion
 *                 example: 2000
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       400:
 *         description: Missing contextId or no valid fields to update
 *       404:
 *         description: Template not found
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.put('/:templateName', authenticateJWT, templateController.updateTemplate);

/**
 * @swagger
 * /templates/{templateName}:
 *   delete:
 *     summary: Delete a template
 *     description: Delete a template by name for a specific context
 *     tags: [templates]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the template to delete
 *         example: "customer-support"
 *       - in: query
 *         name: contextId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the context (app or company)
 *         example: "app123"
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *       400:
 *         description: Missing contextId parameter
 *       404:
 *         description: Template not found
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.delete('/:templateName', authenticateJWT, templateController.deleteTemplate);

module.exports = router; 