const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  area: {
    type: String,
  },
  propertyType: {
    type: String,
    enum: [
      "flat",
      "villa",
      "house",
      "studio",
      "penthouse",
      "office",
      "townhouse",
      "plot",
      "commercial",
    ],
    required: true,
  },
  bathrooms: {
    type: Number,
  },
  bedrooms: {
    type: Number,
  },
  areaSize: {
    type: Number,
  },
  furnishing: {
    type: String,
    enum: ["furnished", "semi-furnished", "unfurnished"],
  },
  amenities: [
    {
      type: String,
    },
  ],
  status: {
    type: String,
    enum: ["sale", "sold"],
    default: "sale",
  },
  images: [{ type: String }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  viewedBy: [{ type: String }],
},{
  timestamps: true
});

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
