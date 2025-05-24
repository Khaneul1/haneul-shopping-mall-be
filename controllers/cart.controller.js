// const { populate } = require('dotenv'); -> 오류 원인
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
    console.log('console cart', cart);
    //이미 카트에 들어간 아이템인지 확인
    //중복된 productId가 있는지 확인하면 되는 것 아닌가 싶지만, 하나의 productId에는 여러 개의 size가 있음
    //s와 m은 엄연히 다른 옷!!!!
    //따라서 productId만 가지고 비교할 게 아니라 사이즈도 생각해야 됨!!
    const existItem = cart.items.find(
      (item) => item.productId.equals(productId) && item.size === size
    ); //equals는 모예요? >> mongoose.ObjectId 타입은 string이 아니기 때문에 equals()를 사용해야 함
    console.log('하늘 렛츠고 ~~', userId, productId, size, qty);

    if (existItem) {
      //그렇다면 에러 ('이미 아이템이 카트에 있습니다')
      throw new Error('아이템이 이미 카트에 담겨 있습니다!');
    }

    //이 정보로 카트에 아이템을 추가해 줌
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();
    console.log('cart console', cart, cart.items.length);
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
    //populate == 몽구스 함수!! findOne처럼... 그래서 import 안 해도 됨
    //다른 함수로 인식해서 다른 게 임포트 돼서 작동 안 된 것
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items',
      //items 밑에서 또 populate 할 것
      populate: {
        path: 'productId',
        model: 'Product',
      },
    }); //userId 기준으로 cart를 찾음
    res.status(200).json({ status: 'success', data: cart.items });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

cartController.deleteCart = async (req, res) => {
  try {
    const { userId } = req;
    // const { productId } = req.body; -> 이게 아니었다...
    //기찬 오빠 코드..... 참고...하기...
    const cartItemId = req.params.id;

    //유저 id로 카트 찾기
    const cart = await Cart.findOne({ userId });

    //productId가 일치하는 아이템을 제외한 나머지만 남기기
    // const filteredItems = cart.items.filter(
    //   (item) => !item.productId.equals(productId)
    // );
    // cart.items = filteredItems

    //이 또한 기찬 오빠 코드 참고하여
    //위에서 사용한 Cart.findOne 이거는 모델에서 찾는 것이라서 몽구스 함수고
    //아래의 .find는 배열(cart.items)에서 찾는 거라서 몽구스 함수 아님 (배열 함수!!!)
    const deleteItem = cart.items.find((item) => item._id == cartItemId);
    if (!deleteItem) throw new Error('상품이 존재하지 않습니다');
    cart.items = cart.items.filter((item) => item._id != cartItemId);
    console.log(cart.items);
    await cart.save();

    res.status(200).json({
      status: 'success',
      message: '아이템이 카트에서 삭제되었습니다.',
      data: cart,
      cartItemCount: cart.items.length,
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

cartController.updateQty = async (req, res) => {
  try {
    const { userId } = req;
    const cartItemId = req.params.id; //id라는 값을 통해서 productId를 읽어옴 (수정하고 싶은 상품)
    const { qty } = req.body;

    const cart = await Cart.findOne({ userId }).populate({
      path: 'items',
      populate: {
        path: 'productId',
        model: 'Product',
      },
    });

    if (!cart) throw new Error('카트가 존재하지 않습니다');
    const updateItem = cart.items.find((item) => item._id == cartItemId);
    if (!updateItem) throw new Error('상품이 존재하지 않습니다');

    //map 까먹어서 적어 놓는 것
    //map() : 배열의 각 요소를 순회하여 콜백 함수를 적용한 결과를 모아 새로운 배열을 반환
    //원본 배열 변경 X -> 배열의 각 요소를 변환하거나 가공한 결과를 적용한 새로운 요소로 배열 생성 위함
    //qty를 사용자가 변경할 경우 해당 요소 변환하여 새로운 요소를 반환해야 하기 때문에 map 사용
    //물론~~ 기찬 오빠 코드 지분 99% ^_^

    //arr.map(function(element, index, array){  }, this);
    //콜백함수(function) : 각 배열 요소에 호출
    //map() : 현재의 elment와 index, 그리고 전체 array 깨체를 해당 요소에 전달
    //this 인수 : 콜백함수 내부에서 사용됨

    cart.items = cart.items.map((item) => {
      if (item._id == cartItemId) item.qty = qty;
      return item;
    });
    await cart.save();
    console.log('cart qty edit', cart, cart.items.length);
    res.status(200).json({ status: 'success', data: cart.items });
  } catch (error) {
    return res.status(400).json({ status: 'fail', error: error.message });
  }
};

cartController.getCartQty = async (req, res) => {
  try {
    const { userId } = req;
    // const cartItemId = req.params.id;
    // const { qty } = req.body; -> 불러올 필요가 없었나 봐요 기찬 오빠 감삼다..
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error('카트가 존재하지 않습니다.');

    // cartItemCount: cart.items.length 뭔가 이게 들어가야 할 것 같은데
    // 어케 코드를 구성해야 될지 모르겠음
    // 해결법 : 기찬 오빠 코드 보기
    const cartItemCount = cart.items.length;

    if (cartItemCount < 0) cartItemCount = 0; //아마도 cartItem 수가 0보다 작으면 쇼핑백 숫자 0으로 설정한다?는 뜻?인가요?
    // await cart.save();
    res.status(200).json({ status: 'success', cartItemCount });
  } catch (error) {
    return res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = cartController;
