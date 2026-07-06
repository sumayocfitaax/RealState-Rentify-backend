const Inquiry = require('../model/inquiryModel')
const Property = require('../model/propertyModel')

exports.sendInquiry = async(req,res) => {
  try {
    const { propertyId, message} = req.body;
    const property = await Property.findById(propertyId).populate('seller');

    if(!property) {
      return res.status(404).json({
        success: false,
        message: 'Property Not Found'
      })
    }

    const inquiry = await Inquiry.create({
      property: property._id,
      buyer: req.user._id,
      seller: property.seller._id,
      message
    })
    res.status(201).json({
      success:true,
      message: 'Inquiry sent successfully',
      inquiry
    })
  } catch (error) {
    res.status(500).json({
      success:false,
      message: error.message
    })
  }
};

//seller view inquiry
exports.getSellerInquiry = async (req,res) => {
  try {
    const inquiry = await Inquiry.find({
      seller: req.user._id
    })
      .populate('buyer', 'name email phone')
      .populate('property', 'title price images city')
      .sort({createdAt: -1})

      res.json({
        success:true,
        count: inquiry.length,
        inquiry
      })
  } catch (error) {
    res.status(500).json({
      success:false,
      message: error.message
    })
  }
};

//mark inquiry read
exports.markAsRead = async (req,res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if(!inquiry){
    return res.status(404).json({
        success: false,
        message: 'Inquiry Not Found'
      })
    }

    inquiry.isRead = true;
    await inquiry.save();
    res.json({
      success: true,
      message:'Marked as read'
    })
  } catch (error) {
    res.status(500).json({
      success:false,
      message: error.message
    })
  }
};
