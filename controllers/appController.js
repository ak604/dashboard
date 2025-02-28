// controllers/appController.js
const appService = require('../services/appService');
const logger = require('../utils/logger');

const createApp = async (req, res) => {
    try {
        const { packageId, name, description } = req.body;

        if (!packageId || !name) {
            return res.status(400).json({ 
                success: false,
                message: 'Package ID and name are required' 
            });
        }

        const appId = await appService.createApp(packageId, name, description);
        
        res.status(201).json({
            success: true,
            data: {
                appId,
                packageId,
                name,
                description
            }
        });
    } catch (error) {
        logger.error('Error creating app:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating app'
        });
    }
};

const getApp = async (req, res) => {
    try {
        const { appId } = req.params;
        const app = await appService.getApp(appId);

        if (!app) {
            return res.status(404).json({
                success: false,
                message: 'App not found'
            });
        }

        res.json({
            success: true,
            data: app
        });
    } catch (error) {
        logger.error('Error retrieving app:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving app'
        });
    }
};

module.exports = {
    createApp,
    getApp
};
