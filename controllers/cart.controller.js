const { populate } = require('dotenv');
const Cart = require('../models/Cart');

const cartController = {};

cartController.addItemToCart = async (req, res) => {
  try {
    //카트에 필요한 정보 가지고 오기 : userId, productId, size, qty
    const { userId } = req;
    const { productId, size, qty } = req.body;
    //유저를 가지고 카트 찾기
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      //유저가 만든 카트가 없다, 만들어 주기
      cart = new Cart({ userId });
      await cart.save();
    }
    //이미 카트에 들어간 아이템인지 확인
    //중복된 productId가 있는지 확인하면 되는 것 아닌가 싶지만, 하나의 productId에는 여러 개의 size가 있음
    //s와 m은 엄연히 다른 옷!!!!
    //따라서 productId만 가지고 비교할 게 아니라 사이즈도 생각해야 됨!!
    const existItem = cart.items.find(
      (item) => item.productId.equals(productId) && item.size === size
    ); //equals는 모예요? >> mongoose.ObjectId 타입은 string이 아니기 때문에 equals()를 사용해야 함
    if (existItem) {
      //그렇다면 에러 ('이미 아이템이 카트에 있습니다')
      throw new Error('아이템이 이미 카트에 담겨 있습니다!');
    }

    //이 정보로 카트에 아이템을 추가해 줌
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();
    res
      .status(200)
      .json({ status: 'success', data: cart, cartItemQty: cart.items.length }); //cartItemQty : 장바구니 상품 개수
  } catch (error) {
    return res.status(400).json({ status: 'fail', error: error.message });
  }
};

cartController.getCart = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items',
      //items 밑에서 또 populate 할 것
      populate: {
        path: 'productId',
        model: 'Product',
      },
    }); //userId 기준으로 cart를 찾음
    res.status(200).json({ status: 'success', dat: cart.items });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = cartController;
