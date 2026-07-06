const express = require('express')
const authRouter = express.Router()
const {login, getMe, forgotPassword, verifyEmail, resetPassword, Register} = require('../controller/authController');
const { protect } = require('../middleWare/authMiddleWare');

authRouter.post('/register', Register);
authRouter.post('/login', login);

authRouter.get('/me', protect, getMe)
authRouter.post('/verify-email', verifyEmail)

authRouter.post('/forget-password', forgotPassword)
authRouter.post('/reset-password/:token', resetPassword)

module.exports = authRouter
