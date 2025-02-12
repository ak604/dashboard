// controllers/companyController.js
const companyService = require('../services/companyService.js');
const logger = require('../utils/logger');

const createCompany = async (req, res) => {
  try {
    const { name, email, phoneNumber, industry } = req.body;
    const companyId = await companyService.createCompany( name, email, phoneNumber, industry);
    res.status(201).send({ companyId: companyId });
  } catch (error) {
    logger.error('Error creating company: ', error);
    res.status(500).send({ message: 'Error creating company', error });
  }
};

const getCompany = async (req, res) => {
  try {
    const company = await companyService.getCompany(req.params.companyId);
    if (company) {
      res.status(200).send(company);
    } else {
      res.status(404).send({ message: 'Company not found' });
    }
  } catch (error) {
    logger.error('Error retrieving company: ', error);
    res.status(500).send({ message: 'Error retrieving company', error });
  }
};

module.exports = { createCompany, getCompany };
