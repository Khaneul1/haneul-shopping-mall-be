const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

// 유저 회원가입 기능 (유저 생성)
router.post('/', userController.createUser);
router.get('/me', authController.authenticate, userController.getUser); //토큰이 valid한 토큰인지 확인/ 이 토큰값 가지고 유저 찾아서 리턴

module.exports = router;
