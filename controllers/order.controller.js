const orderController = {};

const Order = require('../models/Order');
const productController = require('./product.controller');

orderController.createOrder = async (req, res) => {
  try {
    //프론트엔드에서 데이터 보낸 거 받아오기 :: userId, totalPrice, shipTo, contact, orderList 등
    const { userId } = req; //미들웨어에서 와용
    const { shipTo, contact, totalPrice, orderList } = req.body; //프론트엔드에서 갖고 온 정보
    //orderList에는 우리가 주문하고 싶은 아이템이 있음
    //그런데! 재고가 없으면 어떡할 거야? -> 아이템은 항상 stock 정보가 있음
    //고로 사용자가 원하는 대로 전부 주문을 받아 주면 안 됨!

    //재고 확인 & 재고 업데이트
    //재고가 불충분한 아이템 리스트 받아오기
    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    ); //재고 확인하는 함수

    //만약 재고가 충분하지 않는 아이템이 있었다 -> 에러
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        (total, item) => (total += item.message),
        ''
      );
      throw new Error(errorMessage);
    }
    //재고가 충분했다 -> 오더 생성하기로

    //읽어온 걸로 order 생성하기
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(),
    });

    await newOrder.save();
    res.status(200).json({ status: 'success', orderNum: newOrder.orderNum });
  } catch (error) {
    return res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = orderController;
