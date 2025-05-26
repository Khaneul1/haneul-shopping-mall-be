const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { OAuth2client } = require('google-auth-library');
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const authController = {};

authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // token 만들어 주기
        const token = await user.generateToken();
        return res.status(200).json({ status: 'success', user, token });
      }
    }
    throw new Error('유효하지 않은 이메일 또는 비밀번호입니다.');
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

authController.loginWithGoogle = async (req, res) => {
  try {
    // 4. 백엔드에서 로그인하기
    //프론트에서 토큰이라는 키 값으로 값을 보냄!! 얘를 그대로 읽어오면 됨
    const { token } = req.body;
    //이거 해석 어케 해요? 구글에서 제공하는 라이브러리를 사용해야 됨!!
    //>> google auth library : node.js client
    //npm install google-auth-library (이미 설치했음)

    //OAuth2client()에 내가 만든 클라이언트 키 넘겨 줘야 동작함
    const googleClient = new OAuth2client(GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    }); //토큰 해석 코드
    //구글에서 만든 토큰이 맞는지 판별

    const { email, name } = ticket.getPayload();
    console.log('email and name', email, name); //터미널에 출력되는지 꼭 확인할 것

    // a. 이미 로그인을 한 적이 있는 유저 => 로그인 시키고 토큰값 주면 장땡
    // b. 처음 로그인 시도를 한 유저 => 유저 정보 새로 생성 => 토큰값 넘기기
    let user = await User.findOne({ email });
    if (!user) {
      //유저를 새로 생성
      //passwoard 값을 임의로 만들어서 넣어 주기!! >> 구글 로그인 시 password 필요 없지만 User 모델에 required 값이기 때문
      //그래도 암호화는 해 주는 게 좋잖아요? (1) 랜덤화
      const randomPassword = '' + Math.floor(Math.random() * 100000000); //랜덤한 숫자 뽑아서 걔를 스트링화 시켜서 넣어 줌
      //(2) 암호화
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(randomPassword, salt);
      user = new User({
        name, //name:name
        email,
        password: newPassword,
      });
      await user.save(); //회원가입 로직!! 그대로 넣은 것
    }
    //토큰 발행하고 리턴
    const sessionToken = await user.generateToken();
    res.status(200).json({ status: 'success', user, token: sessionToken });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) throw new Error('Token not found');
    const token = tokenString.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error) throw new Error('invalid token');
      req.userId = payload._id;
    });
    next();
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// authenticate에서 받은 userId를 가지고 확인하면 됨!!
// 굳이 또 써 줄 필요 X
// 그래서 ~~ product.api에 authenticate > checkAdminPermission > productController.createProduct
// 위의 순으로 진행되도록 코드 설정
authController.checkAdminPermission = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (user.level !== 'admin') throw new Error('no permission');
    next();
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = authController;
