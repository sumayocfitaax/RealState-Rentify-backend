const jwt = require('jsonwebtoken')
const User = require('../model/userModel')

//protect
exports.protect = async (req,res,next) => {
  try {
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
      token = req.headers.authorization.split(" ")[1]
    }

    if(!token){
      return res.status(401).json({
         success:false,
         message: "not authorized, token missing"
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-password');

    if(req.user && req.user.isBlocked){
      return res.status(403).json({
        success:false,
        message: 'Your account has been blocked by an admin'
      })
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'token invalid', success: false });
  }
}

//role based authentication

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "access denied. You don't have permission."
      })
    }
    next();
  }
}