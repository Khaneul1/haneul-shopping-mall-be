//Cart table
const mongoose = require('mongoose');
const User = require('./User');
const Product = require('./Product');
const Schema = mongoose.Schema;
const cartSchema = Schema(
  {
    // 누구의 카트인가를 알아야 함 > userID 필요
    userId: { type: mongoose.ObjectId, ref: User }, //userID는 User의 주요 키!! 여기선 외래키(FK)로 쓰임
    items: [
      {
        //   어떤 아이템 선택했는지
        productId: { type: mongoose.ObjectId, ref: Product },
        //   어떤 사이즈
        size: { type: String, required: true },
        // 몇 개 구매
        qty: { type: Number, default: 1, required: true }, //최소한 하나는 꼭 들어가 있는 걸로 디폴트값 설정
      },
    ],
  },
  { timestamp: true }
);
productSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v; //버전 정보
  delete obj.updateAt;
  delete obj.createAt;
  return obj;
};

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
