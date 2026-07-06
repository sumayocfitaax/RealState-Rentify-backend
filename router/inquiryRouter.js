const express = require('express');
const { protect, authorize } = require('../middleWare/authMiddleWare');
const { sendInquiry, getSellerInquiry, markAsRead } = require('../controller/inquiryController');


const inquiryRouter = express.Router();

inquiryRouter.post('/', protect, authorize('buyer'), sendInquiry)
inquiryRouter.get('/seller', protect, authorize('seller'), getSellerInquiry);

inquiryRouter.patch('/:id/read', protect, markAsRead)

module.exports = inquiryRouter