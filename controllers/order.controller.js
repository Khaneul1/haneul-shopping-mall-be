const orderController = {};

const { populate } = require('dotenv');
const Order = require('../models/Order');
const { randomStringGenerator } = require('../utils/randomStringGenerator');
const productController = require('./product.controller');
const { model } = require('mongoose');

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
    //save 후에 카트 비워주기! -> Order.js에서 코드 추가
    res.status(200).json({ status: 'success', orderNum: newOrder.orderNum });
  } catch (error) {
    return res.status(400).json({ status: 'fail', error: error.message });
  }
};

//내 주문 페이지
orderController.getOrder = async (req, res, next) => {
  //코알누 정답 코드 참고하고 작성했습니다
  try {
    const { userId } = req; //userId request에서 받아오고

    //Order 모델에서 userId가 userId인 것을 찾아서
    //items 필드에 있는 것들을 populate 안에 있는 요소들로 대체!!
    //item 안에 productId 필드를 다시 product 모델로 체운다는 코드 (select는 어떤 필드를 가져올지 선택하는 것)
    const orderList = await Order.find({ userId: userId }).populate({
      path: 'items',
      populate: {
        path: 'productId',
        model: 'Product',
        select: 'image name',
      },
    });

    //전체 아이템 개수를 알기 위해 user의 주문 아이템을 count 한 값을 변수에 할당
    const totalItemNum = await Order.find({ userId: userId }).count();

    const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
    res.status(200).json({ status: 'success', data: orderList, totalPageNum });
  } catch (error) {
    return res.status(400).json({ status: 'fail', error: error.message });
  }
};

//코알누 정답 코드 및 태양이 코드 참고했습니다......
orderController.getOrderList = async (req, res, next) => {
  try {
    const { page, ordernum } = req.query;
    const { userId } = req;

    //cond == 조건 객체!! (mongoDB에서 사용할 검색 조건 의미)
    //ordernum이 있을 경우 $regex(부분 일치 검색)으로 판단함!!
    //userId를 항상 포함시켜 본인 주문만 필터링하도록 설정
    const cond = ordernum
      ? { ordernum: { $regex: ordernum, $options: 'i' }, userId }
      : { userId };

    //populate로 각 주문의 items.poductId를 실제 Product 모델로 교체
    //order.items[n].productId -> 실제 Product models

    //페이징 처리 : page를 기준으로 skip() + limit() 사용
    //(1) 전체 데이터를 한 번에 보내면 속도 느려지고 서버 과부하!!
    // 따라서 한 페이지당 일부 데이터만 부분적으로 조회할 수 있어야 함
    //(2) 사용자에게 페이지 단위로 보여 주기 위해
    let orderList = await Order.find(cond)
      .populate({
        path: 'items',
        populate: {
          path: 'productId',
          model: 'Product',
        },
      })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE);

    //조건에 맞는 전체 주문 수를 세서 총 페이지 수를 계산!!
    const totalItemNum = await Order.countDocuments(cond);
    const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);

    res.status(200).json({ status: 'success', data: orderList, totalPageNum });
  } catch (error) {
    return res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = orderController;
