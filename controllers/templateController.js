const templateService = require('../services/templateService');
const logger = require('../utils/logger');

// Create a new template
const createTemplate = async (req, res) => {
  try {
    // Get contextId from request body
    const { templateName, systemContent, userContent, contextId, model, temperature, max_completion_tokens } = req.body;
    
    // Validate required fields
    if (!templateName || !systemContent || !userContent || !contextId) {
      return res.status(400).json({ 
        success: false, 
        message: 'templateName, systemContent, userContent, and contextId are required' 
      });
    }
    
    // Create template with all fields
    const templateData = {
      contextId,
      templateName,
      systemContent,
      userContent,
      model,
      temperature,
      max_completion_tokens
    };
    
    const newTemplate = await templateService.createTemplate(templateData);
    
    res.status(201).json({
      success: true,
      data: newTemplate
    });
  } catch (error) {
    logger.error('Error creating template:', error);
    
    if (error.message === 'Template with this name already exists in this context') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating template',
      error: error.message
    });
  }
};

// Get a template by name and contextId
const getTemplate = async (req, res) => {
  try {
    const { contextId } = req.query;
    const { templateName } = req.params;
    
    if (!contextId) {
      return res.status(400).json({
        success: false,
        message: 'contextId is required as a query parameter'
      });
    }
    
    const template = await templateService.getTemplate(contextId, templateName);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    logger.error('Error retrieving template:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving template',
      error: error.message
    });
  }
};

// List all templates for a context
const listTemplates = async (req, res) => {
  try {
    const { contextId } = req.query;
    
    if (!contextId) {
      return res.status(400).json({
        success: false,
        message: 'contextId is required as a query parameter'
      });
    }
    
    const templates = await templateService.listTemplatesByContextId(contextId);
    
    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    logger.error('Error listing templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error listing templates',
      error: error.message
    });
  }
};

// Update a template
const updateTemplate = async (req, res) => {
  try {
    const { contextId } = req.query;
    const { templateName } = req.params;
    
    if (!contextId) {
      return res.status(400).json({
        success: false,
        message: 'contextId is required as a query parameter'
      });
    }
    
    // Validate at least one field to update
    const updates = {};
    const updatableFields = ['systemContent', 'userContent', 'model', 'temperature', 'max_completion_tokens'];
    
    let hasUpdates = false;
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
        hasUpdates = true;
      }
    });
    
    if (!hasUpdates) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    const updatedTemplate = await templateService.updateTemplate(contextId, templateName, updates);
    
    res.status(200).json({
      success: true,
      data: updatedTemplate
    });
  } catch (error) {
    logger.error('Error updating template:', error);
    
    if (error.message === 'Template not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating template',
      error: error.message
    });
  }
};

// Delete a template
const deleteTemplate = async (req, res) => {
  try {
    const { contextId } = req.query;
    const { templateName } = req.params;
    
    if (!contextId) {
      return res.status(400).json({
        success: false,
        message: 'contextId is required as a query parameter'
      });
    }
    
    const deletedTemplate = await templateService.deleteTemplate(contextId, templateName);
    
    if (!deletedTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Template deleted successfully',
      data: deletedTemplate
    });
  } catch (error) {
    logger.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting template',
      error: error.message
    });
  }
};

module.exports = {
  createTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
  deleteTemplate
}; 