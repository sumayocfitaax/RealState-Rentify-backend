const express = require('express')
const { getAllProperties, addProperty, getMyProperties, updateProperty, getPropertyCounts, deleteProperty, updatePropertyStatus, getPropertyDetails, getSellerDashboard } = require('../controller/propertyController')
const { protect, authorize } = require('../middleWare/authMiddleWare')
const upload = require('../middleWare/uploadMiddleWare')


const propertyRouter = express.Router()

propertyRouter.get('/', getAllProperties) 

//protect the route that only seller can do these work
propertyRouter.post('/', protect, authorize('seller'), upload.array('images', 10), addProperty)
propertyRouter.get('/my',  protect, authorize('seller'), getMyProperties);
propertyRouter.put('/:id', protect, authorize('seller'), upload.array('images', 10), updateProperty)

propertyRouter.delete('/:id', protect, authorize('seller'), deleteProperty);
propertyRouter.patch('/:id/status', protect, authorize('seller'), updatePropertyStatus)

propertyRouter.get('/seller/dashboard', protect, authorize('seller'), getSellerDashboard)

propertyRouter.get('/count', getPropertyCounts)
propertyRouter.get('/:id', getPropertyDetails)


module.exports = propertyRouter
