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

module.exports = router;
