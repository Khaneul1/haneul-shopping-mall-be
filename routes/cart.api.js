const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const cartController = require('../controllers/cart.controller');

//누구나 카트에 아이템을 추가할 수 있는가? >> ㄴㄴ 유저만 가능!!!
//토큰값 통해서 카트 찾고 카트에 아이템 추가하기
//admin user인지는 확인할 필요 X

//post()는 생성/백엔드 바디에 담아서 보내야 할 때 자주 사용
router.post('/', authController.authenticate, cartController.addItemToCart);

//userId 찾아낸 다음.. 카트로 넘어가는 것
router.get('/', authController.authenticate, cartController.getCart);

//cart item 삭제
router.delete('/:id', authController.authenticate, cartController.deleteCart);

//qty 수정! put()은 수정할 때 많이 씀
router.put('/:id', authController.authenticate, cartController.updateQty);
//기찬 오빠 감사합니다
router.get('/qty', authController.authenticate, cartController.getCartQty);

module.exports = router;
