const productController = {};
const Product = require('../models/Product');
// product 모델 참고해서 작성하면 됨
productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;
    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    });

    await product.save();
    res.status(200).json({ status: 'success', product });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

productController.getProducts = async (req, res) => {
  // try {
  //   const { page, name } = req.query;
  //   if (name) {
  //     //만약 name에 값이 있다면 > 조건 수행
  //     //정확히 jacket이라 써져 있는 것 말고 해당 단어를 포함한 것들도 보고 싶을 수 있으니까
  //     //name:name이 아니라 ~~ 정규화 마법 부리기
  //     //$options : "i"라는 의미는 대/소문자 구별 안 한다는 것
  //     const products = await Product.find({
  //       name: { $regex: name, $options: 'i' },
  //     });
  //   } else {
  //     const products = await Product.find({});
  //   }
  //조건을 상황에 따라 계속 추가해야 되는 로직이라 비효율적이야 ㅠㅠ
  //검색 조건 모아서 할 수 없나?
  try {
    const { page, name } = req.query;
    //name에 값이 있다면 포함된 것까지 대소문자 구별 없이 찾고, name 값이 없으면 비어있는 걸 넣어주겠다
    const cond = name ? { name: { $regex: name, $options: 'i' } } : {};
    let query = Product.find(cond);

    const productList = await query.exec(); //위에 만들어 뒀던 쿼리 여기서 실행시키겠다
    //선언과 실행 따로 하는 방법 ^

    res.status(200).json({ status: 'success', data: productList });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = productController;
