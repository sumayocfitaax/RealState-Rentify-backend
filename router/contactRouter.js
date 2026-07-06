const express = require('express');
const { createContact, getAllContacts } = require('../controller/contactController');
const { protect, authorize } = require('../middleWare/authMiddleWare');


const contactRouter = express.Router();

contactRouter.post('/', createContact);
contactRouter.get('/', protect, authorize('admin'), getAllContacts)

module.exports = contactRouter