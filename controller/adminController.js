const User = require('../model/userModel')
const Property = require('../model/propertyModel')
const Inquiry = require('../model/inquiryModel');
const propertyRouter = require('../router/propertyRouter');

//view all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({
      success: true,
      count: users.length,
      users
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
		})
  }
};

//block a particular user
exports.blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: user.isBlocked ? 'User Blocked' : "user Unblocked",
      isBlocked: user.isBlocked
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
		})
  }
}

//delete a particular user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'User deleted successfully!'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
		})
  }
};

//view all properties
exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate('seller', 'name email');

    res.json({
      success: true,
      count: propertyRouter.length,
      properties
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
		})
  }
}

//delete a particular property
exports.deleteProperty = async (req, res) => {
  try {
    await propertyRouter.findByIdAndDelete(req.params.id)
    
    res.json({
      success: true,
      message: "property deleted successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
		})
  }
}

// view all inquiries
exports.getAllInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.find()
      .populate('buyer', 'name, email')
      .populate('seller', 'name email')
      .populate('property', 'title price')
      .sort({createdAt: -1})

    res.json({
      success: true,
      count: inquiry.length,
      inquiry
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
		})
  }
}
//dashboard analytics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUser = await User.countDocuments();
    const totalProperty = await Property.countDocuments();

    const activeListings = await Property.countDocuments({
      status: 'sale'
    });
    const soldProperty = await Property.countDocuments({
      status: 'sold'
    });

    res.json({
      success: true,
      stats: {
        totalUser,
        totalProperty,
        activeListings,
        soldProperty
      }
    })

  } catch (error) {
    res.status(500).json({
      message: error.message
		})
  }
}

// get pending seller account
exports.getPendingSellers = async (req, res) => {
  try {
    const pendingSellers = await User.find({
      role: "seller",
      isApproved: false
    }).select('-password');
    // if you are a seller you will get approval from the admin panel

    res.json({
      success: true,
      count: pendingSellers.length,
      pendingSellers
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
		})
  }
};

//now to approve a seller
exports.approvedSeller = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);
    if(!seller || seller.role !== 'seller'){
      return res.status(404).json({
        success: false,
        message: 'You are not the seller or seller no found'
      })
    }

    seller.isApproved = true;
    await seller.save();
    res.json({
      success: true,
      message: "seller approved successfully",
      seller
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
		})
  }
};