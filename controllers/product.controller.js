const productController = {};
const Product = require('../models/Product');
const PAGE_SIZE = 1;

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
    let response = { status: 'success' };

    //만약 page 값이 존재한다면
    if (page) {
      //skip()과 limig()
      //mongoose의 함수로! 파라미터로 숫자를 받아감
      //내가 skip 하고 싶은 데이터를 스킵할 수 있게 해 줌
      //10개의 데이터 중에서, 한 페이지당 5개의 데이터만 보여 주고 싶다면 limit(5) 사용
      //최대 몇 개까지만 보낼 건지에 대해 사용하는 게 limit()

      //두 번째 페이지에서는 나머지 5개의 데이터를 보여 줘야 함!
      //이럴 경우 첫 번째 페이지의 5개 데이터를 skip() 해 줘야 함
      //15개의 데이터라면, 3페이지에 갔을 때 10개의 데이터를 스킵해 줘야 하는 것!

      //page - 1 : 인덱스 값처럼! 그다음 내 페이지 사이즈만큼 곱해 주기
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      //15개의 데이터 중에서, 3페이지를 눌렀을 경우 3-1=2, 2*5 =10 (그럼 총 10개의 데이터 건너뛰고)
      //limit(5)로 나머지 5개의 데이터만 보여 주겠다는 의미~!!!

      //전체 페이지 개수 = 전체 데이터 개수 / 페이지 사이즈
      const totalItemNumber = await Product.countDocuments(cond); //데이터 총 몇 개 있는지 확인하고
      const totalPageNum = Math.ceil(totalItemNumber / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    const productList = await query.exec(); //위에 만들어 뒀던 쿼리 여기서 실행시키겠다
    //선언과 실행 따로 하는 방법 ^
    response.data = productList;

    res.status(200).json(response); //상황에 따라 어떤 resp가 전달될지 결정됨
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id; //id라는 값을 통해서 productId를 읽어옴 (수정하고 싶은 상품)
    const {
      sku,
      name,
      size,
      image,
      price,
      description,
      category,
      stock,
      status,
    } = req.body; //어떤 데이터를 수정하고자 하는지 모르기 때문에 전체를 불러옴

    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { sku, name, size, image, price, description, category, stock, status },
      { new: true } //update 함수들에 옵션으로 줄 수 있는 값 중 하나
      //new : true를 넣어주면 업데이트한 후 새로운 값을 반환받을 수 있음!!
    ); //상품 업데이트 : productId를 바뀐 값으로 업데이트하기

    if (!product) throw new Error('상품이 존재하지 않습니다.');
    res.status(200).json({ status: 'success', data: product });
  } catch (error) {
    console.log('상품 수정 실패...');
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(400)
        .json({ status: 'fail', message: '상품을 찾을 수 없습니다.' });
    }

    await Product.findByIdAndDelete(productId);
    res
      .status(200)
      .json({ status: 'success', message: '상품이 삭제되었습니다.' });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = productController;
