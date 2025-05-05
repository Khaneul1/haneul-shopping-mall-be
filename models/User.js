//User table
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// userSchema
// 필수로 요구되어야 하고(required)
// 유니크한 값이어야 함 (unique)
const userSchema = Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    // 권한 설정을 위한 level
    // default값은 고객임
    level: { type: String, default: 'customer' }, //2 type: customer, admin
  },
  { timestamp: true }
);
userSchema.methods.toJSON = function () {
  const obj = this._doc;
  // 전체 document를 받되, password 삭제해 주고 (누구나 알아서는 안 되니까)
  delete obj.password;
  delete obj.__v; //버전 정보
  delete obj.updateAt;
  delete obj.createAt;
  return obj;
};

userSchema.methods.generateToken = async function () {
  const token = await jwt.sign({ _id: this.id }, JWT_SECRET_KEY, {
    expiresIn: '1d',
  });
  return token;
};

const User = mongoose.model('User', userSchema); //userSchema를 모델로 뽑음
module.exports = User;
