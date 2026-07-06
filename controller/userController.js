const User = require('../model/userModel')
const { uploadToCloudinary } = require('../utils/uploadToCloudinary')

//get profile

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')

    res.status(200).json({success: true, user})
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}; 

//to get public profile
exports.getPublicProfile = async (req, res) => {
  try {
   const user = await User.findById(req.params.id).select("name profilePic role createdAt") 

  if(!user) {
  return res.status(404).json({
    success:false,
    message: "user not found"
  })
  }

  res.status(200).json({
    success:true,
    user
  })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}

//update profile
exports.updateProfile = async (req, res) => {
  try {
    const {name, phone, address, removeProfilePic} = req.body;
    const user = await User.findById(req.user._id);

    if(!user) {
      return res.status(404).json({
        success:false,
        message: "user Not found"
      });
    }

    //image handling
    if(req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'profiles');
      user.profilePic = result.secure_url;
    } else if(removeProfilePic === 'true'){
      user.profilePic = null;
    }

    if(name !== undefined) user.name = name;
    if(phone !== undefined) user.phone = phone;
    if(address !== undefined) user.address = address;

    const updatedUser = await user.save();
    res.json({
      success: true,
      message: 'profile updated',
      user: updatedUser
    })
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({
      message: error.message
    })
  }
}