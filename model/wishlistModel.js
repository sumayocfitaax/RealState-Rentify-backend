const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property"
  }
})
const Wishlist = mongoose.model('wishlist', wishlistSchema);

module.exports = Wishlist