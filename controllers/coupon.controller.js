const Coupon = require('../models/Coupon');

const couponController = {};

couponController.validateCoupon = async (req, res) => {
  const { code } = req.body;
  try {
    const coupon = await Coupon.findOne({ code, isActive: true });
    if (!coupon) {
      return res.status(400).json({ message: '유효하지 않은 쿠폰입니다.' });
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: '만료된 쿠폰입니다' });
    }

    res.status(200).json({
      status: 'success',
      message: '쿠폰 적용 성공',
      disCountRate: coupon.disCountRate,
    });
  } catch (error) {
    res
      .status(400)
      .json({ status: 'fail', message: '서버 오류', error: error.error });
  }
};
