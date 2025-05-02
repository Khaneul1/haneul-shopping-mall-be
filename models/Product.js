//Product table
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const productSchema = Schema(
  {
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, required: true }, //이미지 주소를 전달받기 때문에 string
    category: { type: Array, required: true }, //카테고리가 여러 개 속할 수 있기 때문에 array 형태임
    description: { type: String, required: true }, //상품 설명
    price: { type: Number, required: true },
    stock: { type: Object, required: true }, //재고 정보
    status: { type: String, default: 'active' }, //디스플레이 될 만한 상품인지 아닌지 (기본 값은 활성화)
    isDeleted: { type: Boolean, default: false }, //삭제됐는지 안 됐는지 표시만 하는 것
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

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
