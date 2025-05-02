const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// 유저 회원가입 기능 (유저 생성)
router.post('/', userController.createUser);

module.exports = router;
