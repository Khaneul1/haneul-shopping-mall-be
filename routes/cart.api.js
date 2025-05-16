const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const cartController = require('../controllers/cart.controller');

//누구나 카트에 아이템을 추가할 수 있는가? >> ㄴㄴ 유저만 가능!!!
//토큰값 통해서 카트 찾고 카트에 아이템 추가하기
//admin user인지는 확인할 필요 X
router.post('/', authController.authenticate, cartController.addItemToCart);

//userId 찾아낸 다음.. 카트로 넘어가는 것
router.get('/', authController.authenticate, cartController.getCart);

module.exports = router;
