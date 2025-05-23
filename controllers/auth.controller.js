const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authController = {};

authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // token 만들어 주기
        const token = await user.generateToken();
        return res.status(200).json({ status: 'success', user, token });
      }
    }
    throw new Error('유효하지 않은 이메일 또는 비밀번호입니다.');
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};
authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) throw new Error('Token not found');
    const token = tokenString.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error) throw new Error('invalid token');
      req.userId = payload._id;
    });
    next();
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// authenticate에서 받은 userId를 가지고 확인하면 됨!!
// 굳이 또 써 줄 필요 X
// 그래서 ~~ product.api에 authenticate > checkAdminPermission > productController.createProduct
// 위의 순으로 진행되도록 코드 설정
authController.checkAdminPermission = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (user.level !== 'admin') throw new Error('no permission');
    next();
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = authController;
