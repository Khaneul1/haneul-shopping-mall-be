const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

require('dotenv').config();
app.use(cors()); //cors를 사용하는 거니까 app.use 사용해야 함
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); //req.body가 객체로 인식됨

// 데이터베이스 세팅
const mongoURI = process.env.LOCAL_DB_ADDRESS;
mongoose
  .connect(mongoURI, { useNewUrlParser: true })
  .then(() => console.log('mongoose connected'))
  .catch((err) => console.log('DB connection fail', err));

// 포트 설정
// 만약 포트 설정이 잘못되어 PORT 값이 출력이 안 되더라도 5000 포트로 갈 수 있게끔 설정
app.listen(process.env.PORT || 5000, () => {
  console.log('server on');
});
