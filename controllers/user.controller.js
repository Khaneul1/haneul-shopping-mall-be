const User = require('../models/User');
const bcrypt = require('bcryptjs'); //bycrypt는 지원을 안 해서 bcryptjs로 다운받아야 함

const userController = {};

userController.createUser = async (req, res) => {
  try {
    //   회원가입 할 때 : 이름, 이메일, 패스워드, 레벨(권한)
    let { email, password, name, level } = req.body;
    //   해당 이메일로 가입된 유저가 있냐 없냐 판단
    // const user = await User.findOne({ email: email }); //user schema에서 email의 값이 email인 사람 찾아
    const user = await User.findOne({ email }); //key === value면 하나로 줄일 수 있지요
    if (user) {
      throw new Error('User already exist');
    }
    const salt = await bcrypt.genSaltSync(10);
    password = await bcrypt.hash(password, salt); //salt와 password 섞어서 password 값 재정의 됨

    // 암호화 된 패스워드, 존재 확인 이메일, 이름을 가진 새로운 User 정보 생성
    const newUser = new User({
      email,
      password,
      name,
      // 레벨 설정시
      // 레벨 값이 있다면 그대로 레벨 설정, 없다면 고객으로 설정
      // 보통 레벨 같은 경우에는 customer은 잘 안 쓰고 admin 세팅할 때만 쓰니까!
      level: level ? level : 'customer',
    });
    await newUser.save();
    console.log('create new user success', newUser);
    return res.status(200).json({ status: 'success' });

    //   유저 정보 저장하기 전 패스워드 암호화!!
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

userController.getUser = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    console.log('get user success');
    if (user) {
      return res.status(200).json({ status: 'success', user }); //user: user
    }
    throw new Error('invalid token');
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = userController;
