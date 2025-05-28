const mongoose = require('mongoose');
const Product = require('./Product');
const Schema = mongoose.Schema;

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountRate: { type: Number, required: true },
  isActive: { type: bollean, default: true },
  expiresAt: { type: Date },
});

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = couponSchema;
