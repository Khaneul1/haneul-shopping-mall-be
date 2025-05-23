const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();
const orderController = require('../controllers/order.controller');

router.post('/', authController.authenticate, orderController.createOrder); ///api/order

module.exports = router;
