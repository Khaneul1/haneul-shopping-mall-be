const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();
const productController = require('../controllers/product.controller');

// admin인지 아닌지 확인하는 작업 후 productController.createProduct로 넘어가도록!!
router.post(
  '/',
  authController.authenticate,
  authController.checkAdminPermission,
  productController.createProduct
);

router.get('/', productController.getProducts); //product 읽어오는 건 admin 필요 없자나
router.get('/:id', productController.getProductDetail);

router.put(
  '/:id',
  authController.authenticate,
  authController.checkAdminPermission,
  productController.updateProduct
); //상품 수정 (상품의 id값 받아와서 수정) :: admin permission 체크해 줘야지 ~!!!

router.delete(
  '/:id',
  authController.authenticate,
  authController.checkAdminPermission,
  productController.deleteProduct
);

module.exports = router;
