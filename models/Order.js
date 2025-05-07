//Cart table
const mongoose = require('mongoose');
const User = require('./User');
const Product = require('./Product');
const Schema = mongoose.Schema;
const orderItemSchema = Schema(
  {
    userId: { type: mongoose.ObjectId, ref: User, required: true },
    shipTo: { type: String, required: true }, //배송지
    contact: { type: Object, required: true }, //type이 string일 줄 알았다
    status: { type: String, default: 'preparing' }, //fin으로 설정했는데 좀 더 직관적인 preparing이 정답이었다
    totalPrice: { type: Number, required: true, default: 0 }, //default값 설정을 해야 한다고 생각 못했음
    orderNum: { type: String }, //주문번호
    item: [
      {
        //   어떤 아이템 선택했는지
        productId: { type: mongoose.ObjectId, ref: Product, required: true },
        //   어떤 사이즈
        size: { type: String, required: true },
        // 몇 개 구매
        qty: { type: Number, default: 1, required: true }, //최소한 하나는 꼭 들어가 있는 걸로 디폴트값 설정
        price: { type: Number, required: true },
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

const Order = mongoose.model('ORder', orderItemSchema);
module.exports = Order;
