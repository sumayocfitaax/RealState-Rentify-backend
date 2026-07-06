const express = require('express');
const { protect } = require('../middleWare/authMiddleWare');
const { addWishlist, getWishlist, removeWishlist } = require('../controller/wishlistController');


const wishlistRouter = express.Router();

wishlistRouter.post('/:propertyId', protect, addWishlist);
wishlistRouter.get('/',protect, getWishlist);

wishlistRouter.delete('/:propertyId', protect, removeWishlist);

module.exports = wishlistRouter