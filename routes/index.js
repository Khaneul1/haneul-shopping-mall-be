const express = require('express');
const router = express.Router();
const userApi = require('./user.api');
const authApi = require('./auth.api');
const productApi = require('./product.api');

// 뭘 세팅할까용? 순서부터 정하면 좋음
// 1. User 세팅
// 다른 아이템들은 dependency 의존성이 높음
// 외래키도 사용해야 하고... 연결되어 있으니까 의존성이 없는 user/product 먼저 해 줍쉬다

// 테이블 생성하는 유저 회원가입 기능
router.use('/user', userApi);

router.use('/auth', authApi);
router.use('/product', productApi);

module.exports = router; //이거는 app.js에서 받아서 씀
