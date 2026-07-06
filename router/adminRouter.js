const express = require('express');
const { protect, authorize } = require('../middleWare/authMiddleWare');
const { getAllUsers, blockUser, deleteUser, getAllProperties, deleteProperty, getAllInquiry, getDashboardStats, getPendingSellers, approvedSeller } = require('../controller/adminController');


const adminRouter = express.Router();

adminRouter.use(protect, authorize('admin'))

adminRouter.get('/users', getAllUsers)
adminRouter.patch('/users/:id/block', blockUser)

adminRouter.delete('/users/:id', deleteUser)
adminRouter.get('/properties', getAllProperties)

adminRouter.delete('/properties/:id', deleteProperty)
adminRouter.get('/inquiries', getAllInquiry)

adminRouter.get('/stats', getDashboardStats)

adminRouter.get('/pending-sellers', getPendingSellers)
adminRouter.patch('/approve-seller/:id', approvedSeller)


module.exports = adminRouter