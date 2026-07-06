const express = require('express')
const { getProfile, updateProfile, getPublicProfile } = require('../controller/userController')
const upload = require('../middleWare/uploadMiddleWare')
const {protect} = require('../middleWare/authMiddleWare')


const userRouter = express.Router()

userRouter.get('/profile', protect, getProfile);
userRouter.put('/profile',protect, upload.single('profilePic'),updateProfile);
userRouter.get('/public/:id', getPublicProfile)

module.exports = userRouter