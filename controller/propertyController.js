const Property = require('../model/propertyModel')
const Inquiry = require('../model/inquiryModel')
const { uploadToCloudinary } = require("../utils/uploadToCloudinary");
const jwt = require('jsonwebtoken')
const cloudinary = require("cloudinary").v2;

//add a property

// exports.addProperty = async (req, res) => {
//   try {
//     let imageUrls = [];
//     if(req.files && req.files.length > 0){
//       for(let file of req.files) {
//         const result = await uploadToCloudinary(file.buffer);
//         imageUrls.push(result.secure_url)
//       }
//     }

//     const property = await Property.create({
//       title: req.body.title,
//       description: req.body.description,
//       price: Number(req.body.price),
//       city: req.body.city,
//       area: req.body.area,
//       propertyType: req.body.propertyType,
//       bathrooms: req.body.bathrooms ? Number(req.body.bathrooms) : undefined,
//       areaSize: req.body.areaSize ? Number(req.body.areaSize) : undefined,
//       furnishing: req.body.furnishing,
//       status: req.body.status,
//       images: imageUrls,
//       seller: req.user._id, //seller on create property
//       amenities: req.body.amenities
//         ? Array.isArray(req.body.amenities)
//           ? req.body.amenities
//           : (() => {
//             try {
//               return JSON.parse(req.body.amenities);
//             } catch (e) {
//               return req.body.amenities.split(",");
//             }
//           })()
//         : [],
//     });

//   }catch (error) {
//     console.error("ADD_PROPERTY_ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Internal server error while adding property",

//     });
//   }
// }

exports.addProperty = async (req, res) => {
  try {
    let imageUrls = [];

    // 1. Fix the iterable bug and run uploads in PARALLEL using Promise.all
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
      const uploadResults = await Promise.all(uploadPromises);
      imageUrls = uploadResults.map(result => result.secure_url);
    }

    // 2. Create the property record
    const property = await Property.create({
      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),
      city: req.body.city,
      area: req.body.area,
      propertyType: req.body.propertyType,
      bathrooms: req.body.bathrooms ? Number(req.body.bathrooms) : undefined,
      bedrooms: req.body.bedrooms ? Number(req.body.bedrooms) : undefined,
      areaSize: req.body.areaSize ? Number(req.body.areaSize) : undefined,
      furnishing: req.body.furnishing,
      status: req.body.status,
      images: imageUrls,
      seller: req.user._id, 
      amenities: req.body.amenities
        ? Array.isArray(req.body.amenities)
          ? req.body.amenities
          : (() => {
              try {
                return JSON.parse(req.body.amenities);
              } catch (e) {
                return req.body.amenities.split(",");
              }
            })()
        : [],
    });

    // 3. CRITICAL: You forgot to return a success response!
    return res.status(201).json({
      success: true,
      message: "Property added successfully",
      data: property
    });

  } catch (error) {
    console.error("ADD_PROPERTY_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error while adding property",
    });
  }
};

//to get my properties

exports.getMyProperties = async (req, res) => {
  try {
    
    const properties = await Property.find({
    seller:req.user._id
      }).populate("seller", "name profilePic");
    
    res.json({
      success:true,
      properties
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message 

    });
  }
};
 
// UPDATE PROPERTY
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (property.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }
    
    const fields = [
      "title",
      "description",
      "price",
      "city",
      "area",
      "propertyType",
      "bathrooms",
      "bedrooms",
      "areaSize",
      "furnishing",
      "status",
      "amenities",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "amenities" && typeof req.body[field] === "string") {
          try {
            property[field] = JSON.parse(req.body[field]);
          } catch (e) {
            property[field] = req.body[field].split(",");
          }
        } else {
          property[field] = req.body[field];
        }
      }
    });

    //image handling
    if (req.body.existingImages) {
      try {
        const existing = JSON.parse(req.body.existingImages);
        property.images = Array.isArray(existing) ? existing : property.images;
      } catch (e) {
        console.error("Failed to parse existingImages:", e);
      }
    }//deleting existing image

    //upload new images if exist the old one
    if (req.files && req.files.length > 0) {
      let newImages = [];
      for (let file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "properties");
        newImages.push(result.secure_url);
      }
      property.images = [...property.images, ...newImages];
    }

    await property.save();

    res.json({
      success: true,
      message: "Property updated",
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//delete property 

exports.deleteProperty = async (req,res) => {
  try {
    const property = await Property.findById(req.params.id);
    if(!property){
      return res.status(404).json({
        success:false,
        message: 'property not found'
      });
    }

    //check the ownership
    if(property.seller.toString() !== req.user._id.toString()){
      return res.status(403).json({
        success: false,
        message: 'not authorized'
      })
    }

    //delete image from cloudinary
    for (let imageUrl of property.images) {
      const publicId = imageUrl.split('/').pop().split('.')[0]
      await cloudinary.uploader.destroy('properties/' + publicId)
    }

    await property.deleteOne();
    res.json({
      success: true,
      message: 'property deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update property status

exports.updatePropertyStatus = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if(!property){
      return res.status(404).json({
        success:false,
        message: 'property not found'
      });
    }

    //check the ownership
    if(property.seller.toString() !== req.user._id.toString()){
      return res.status(403).json({
        success: false,
        message: 'not authorized'
      })
    }

    property.status = req.body.status;
    await property.save();
    res.json({
      success:true,
      message: 'property status  updated successfully',
      property
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// GET ALL PROPERTIES
exports.getAllProperties = async (req, res) => {
  try {
    const {
      city,
      area,
      propertyType,
      furnishing,
      status,
      minPrice,
      maxPrice,
      amenities,
      bedrooms,
      sort,
      seller,
    } = req.query;

    let query = {
      status: "sale",
    };

    if (seller) query.seller = seller;
    if (city) query.city = new RegExp(city, "i");
    if (area) query.area = new RegExp(area, "i");

    if (propertyType) {
      query.propertyType = { $in: propertyType.toLowerCase().split(",") };
    }
    
    if (furnishing) {
      const furnishingArray = furnishing.split(",");
      query.furnishing = {
        $in: furnishingArray.map((f) => new RegExp(`^${f.trim()}$`, "i")),
      };
    }
    if (status) query.status = status;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice && !isNaN(minPrice)) query.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(maxPrice)) query.price.$lte = Number(maxPrice);
      if (Object.keys(query.price).length === 0) delete query.price;
    }

    if (amenities) {
      query.amenities = {
        $in: amenities.split(",").map((a) => a.trim()),
      };
    }

    if (bedrooms) {
      const bedroomArray = bedrooms.split(",").map(Number).filter(n => !isNaN(n));

      if (bedroomArray.length > 0) {
        query.bedrooms = { $in: bedroomArray };
      }
    }

    let sortOption = { createdAt: -1 };
    if (sort === "priceLow") sortOption = { price: 1 };
    if (sort === "priceHigh") sortOption = { price: -1 };
    if (sort === "latest") sortOption = { createdAt: -1 };

    const properties = await Property.find(query)
      .populate("seller", "name phone profilePic")
      .sort(sortOption);

    res.json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching properties",
      error: error.message,
    });
  }
};

// get property details

exports.getPropertyDetails = async (req, res) =>{
  try {
    const property = await Property.findById(req.params.id).populate(
      'seller',
      'name email phone profilePic'
    );
    if(!property){
      return res.status(404).json({
        success:false,
        message: 'property not found'
      });
    }

    //unique view tracking by id
    let visitorId = req.ip;
    const authHeader = req.headers.authorization;
    if(authHeader && authHeader.startsWith('Bearer')){
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        visitorId = decoded.id
      } catch (error) {
        //ignore
      }
    }

    const isSellerChecking = visitorId === property.seller._id.toString();
    if(!isSellerChecking && !property.viewedBy.includes(visitorId)){
      property.views += 1;
      property.viewedBy.push(visitorId)
      await property.save()
    }

    const similarProperties = await Property.find({
      _id: {$ne: property._id},
      city: property.city,
      propertyType: property.propertyType,
      status: property.status,
    })

    .limit(4)
    .select('title price images city area propertyType areaSize status')

    res.json({
      success: true,
      property,
      similarProperties  
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//seller dashboard

exports.getSellerDashboard = async (req,res) => {
  try {
    const sellerId = req.user._id;
    const totalProperties = await Property.countDocuments({ seller: sellerId})
    const activeListings = await Property.countDocuments({
      seller: sellerId,
      status: 'sale'
    })

    const soldProperties = await Property.countDocuments({
      seller: sellerId,
      status: 'sold'
    })

    const totalInquiries = await Inquiry.countDocuments({ seller: sellerId});

    //calculate total views fo all properties
    const viewData = await Property.aggregate([
      {$match: { seller: sellerId } },
      {$group: {_id: null, totalViews: {$sum: '$views'} } }
    ]);
    const totalViews = viewData.length > 0 ? viewData[0].totalViews : 0;

    res.json({
      success: true,
      stats:{
        totalProperties,
        activeListings,
        soldProperties,
        totalInquiries,
        totalViews
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

//GET PROPERTY COUNTS BY TYPE
exports.getPropertyCounts = async (req, res) => {
  try {
    const counts = await Property.aggregate([
      { $match: { status: "sale" } },
      { $group: { _id: "$propertyType", count: { $sum: 1 } } }
    ]);

    const formattedCounts = counts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}); 
    
    res.json({
      success:true,
      count: formattedCounts
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'internal server error while fetching counts',
      error:  error.message
    });
  }
}
    