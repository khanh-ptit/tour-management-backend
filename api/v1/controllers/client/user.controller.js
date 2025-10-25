const User = require("../../models/user.model");
const Cart = require("../../models/cart.model");
const ForgotPassword = require("../../models/forgot-password.model");
const RoomChat = require("../../models/room-chat.model");
const Account = require("../../models/account.model");
const VerifyUser = require("../../models/verify-user.model");
const generateHelper = require("../../../../helpers/generate");
const sendMailHelper = require("../../../../helpers/sendMail");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const cron = require("node-cron");
const Order = require("../../models/order.model");

// [POST] /api/v1/user/register
module.exports.register = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Kiểm tra email đã tồn tại
    const existEmail = await User.findOne({
      email,
      status: "active",
      deleted: false,
    });
    if (existEmail) {
      return res
        .status(400)
        .json({ code: 400, message: "Email đã được sử dụng!" });
    }

    // Kiểm tra số điện thoại đã tồn tại
    const existPhone = await User.findOne({
      phone,
      status: "active",
      deleted: false,
    });
    if (existPhone) {
      return res
        .status(400)
        .json({ code: 400, message: "Số điện thoại đã được sử dụng!" });
    }

    // Mã hóa mật khẩu bằng MD5
    const hashedPassword = md5(password);

    const newUser = new User({ ...req.body, password: hashedPassword });
    const newCart = new Cart({
      userId: newUser._id,
      tours: [],
    });

    // Tạo user mới
    await newCart.save();
    newUser.cartId = newCart._id;
    await newUser.save();

    // Lấy danh sách admin
    const admins = await Account.find({ deleted: false });

    // Tạo phòng chat cho user và admin
    const newRoomChat = new RoomChat({
      title: `Hỗ trợ khách hàng - ${newUser.email}`,
      typeRoom: "support",
      status: "active",
      user: newUser._id, // Chỉ có 1 user
      admins: admins.map((admin) => ({ adminId: admin._id })), // Danh sách admin
    });

    await newRoomChat.save();

    // Tạo JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Verify user (Đăng ký lần đầu --> bắt verify)
    const secretKey = process.env.SECRET_KEY_HOTP;
    const counter = Math.floor(Date.now() / 1000);
    const otp = generateHelper.generateHOTP(secretKey, counter, 6);
    const objVerifyUser = {
      email: email,
      otp: otp,
      expireAt: new Date(Date.now() + 180 * 1000),
    };
    const newVerifyUser = new VerifyUser(objVerifyUser);
    await newVerifyUser.save();

    const subject = `Mã xác thực OTP kích hoạt tài khoản`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #004FA8; color: white; padding: 20px; text-align: center; font-size: 22px; font-weight: bold;">
                Xác Thực OTP
            </div>
            <div style="padding: 20px; line-height: 1.6;">
                <p style="font-size: 16px; color: #333;">Xin chào,</p>
                <p style="font-size: 16px; color: #333;">Bạn vừa đăng ký tài khoản trên hệ thống. Dưới đây là mã OTP để kích hoạt: </p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 28px; font-weight: bold; color: #004FA8; background-color: #E6F4FF; padding: 15px 25px; border: 2px dashed #004FA8; border-radius: 8px;">
                        ${otp}
                    </span>
                </div>
                <p style="font-size: 14px; color: #555;">
                    <b>Lưu ý:</b> Mã OTP này chỉ có hiệu lực trong vòng <b>3 phút</b>. Không chia sẻ mã này với bất kỳ ai để đảm bảo an toàn tài khoản.
                </p>
                <p style="font-size: 14px; color: #555;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
                <p style="font-size: 14px; color: #555;">Trân trọng,<br><span style="color: #004FA8; font-weight: bold;">Top Ten Travel - Vòng quanh thế giới</span></p>
            </div>
            <div style="background-color: #004FA8; text-align: center; padding: 15px; font-size: 12px; color: #fff;">
                Email này được gửi từ hệ thống của Top Ten Travel. Nếu không phải bạn thực hiện yêu cầu, vui lòng liên hệ ngay với chúng tôi.
            </div>
        </div>
    `;

    sendMailHelper.sendMail(email, subject, html);

    res.status(201).json({
      code: 201,
      message: "Đăng ký thành công. Vui lòng nhập OTP để kích hoạt!",
      user: newUser,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Đã xảy ra lỗi khi đăng ký!" });
  }
};

// [POST] /api/v1/user/verify/resend-otp/:email
module.exports.resendVerifyOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, deleted: false });

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "Email không tồn tại hoặc chưa được đăng ký",
      });
    }

    if (user.status === "active") {
      return res.status(400).json({
        code: 400,
        message: "Tài khoản đã được xác thực rồi!",
      });
    }

    if (user.status === "inactive") {
      return res.status(400).json({
        code: 400,
        message:
          "Tài khoản đang bị vô hiệu hóa tạm thời. Vui lòng thử lại sau!",
      });
    }

    const recentVerifications = await VerifyUser.find({
      email: email,
      expireAt: { $gt: new Date(Date.now() - 3 * 60 * 1000) },
    });

    if (recentVerifications.length >= 3) {
      user.status = "inactive";
      user.lockedUntil = new Date(Date.now() + 3 * 60 * 1000);
      user.lockedBy = "verifyEmail"; // Cập nhật nguồn khóa
      await user.save();

      return res.status(400).json({
        code: 400,
        message:
          "Quá nhiều yêu cầu OTP. Tài khoản của bạn đã bị khóa trong 3 phút.",
      });
    }

    const secretKey = process.env.SECRET_KEY_HOTP;
    const counter = Math.floor(Date.now() / 1000);
    const otp = generateHelper.generateHOTP(secretKey, counter, 6);
    const objVerifyUser = {
      email: email,
      otp: otp,
      expireAt: new Date(Date.now() + 180 * 1000),
    };
    const newVerifyUser = new VerifyUser(objVerifyUser);
    await newVerifyUser.save();

    const subject = `Mã xác thực OTP kích hoạt tài khoản`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #004FA8; color: white; padding: 20px; text-align: center; font-size: 22px; font-weight: bold;">
                Xác Thực OTP
            </div>
            <div style="padding: 20px; line-height: 1.6;">
                <p style="font-size: 16px; color: #333;">Xin chào,</p>
                <p style="font-size: 16px; color: #333;">Bạn vừa đăng ký tài khoản trên hệ thống. Dưới đây là mã OTP để kích hoạt: </p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 28px; font-weight: bold; color: #004FA8; background-color: #E6F4FF; padding: 15px 25px; border: 2px dashed #004FA8; border-radius: 8px;">
                        ${otp}
                    </span>
                </div>
                <p style="font-size: 14px; color: #555;">
                    <b>Lưu ý:</b> Mã OTP này chỉ có hiệu lực trong vòng <b>3 phút</b>. Không chia sẻ mã này với bất kỳ ai để đảm bảo an toàn tài khoản.
                </p>
                <p style="font-size: 14px; color: #555;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
                <p style="font-size: 14px; color: #555;">Trân trọng,<br><span style="color: #004FA8; font-weight: bold;">Top Ten Travel - Vòng quanh thế giới</span></p>
            </div>
            <div style="background-color: #004FA8; text-align: center; padding: 15px; font-size: 12px; color: #fff;">
                Email này được gửi từ hệ thống của Top Ten Travel. Nếu không phải bạn thực hiện yêu cầu, vui lòng liên hệ ngay với chúng tôi.
            </div>
        </div>
    `;

    sendMailHelper.sendMail(email, subject, html);
    res.status(200).json({
      code: 200,
      message: "Đã gửi OTP. Vui lòng xác thực để kích hoạt tài khoản",
    });
  } catch {
    res.status(500).json({
      code: 500,
      message: "Lỗi máy chủ",
    });
  }
};

// [POST] /api/v1/user/verify
module.exports.verifyUser = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const existUser = await User.findOne({
      email,
      deleted: false,
    });
    if (!existUser) {
      return res.status(404).json({
        code: 404,
        message: "Người dùng không tồn tại",
      });
    }

    const checkOtpObj = await VerifyUser.findOne({ email }).sort({
      createdAt: -1,
    });
    if (!checkOtpObj || checkOtpObj.otp !== otp) {
      return res.status(400).json({
        code: 400,
        message: "OTP không hợp lệ",
      });
    }

    await VerifyUser.deleteMany({
      email: email,
    });
    await User.updateOne(
      {
        email,
      },
      {
        status: "active",
      }
    );

    res.status(200).json({
      code: 200,
      message: "Kích hoạt thành công, đăng nhập để tiếp tục",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Lỗi máy chủ",
    });
  }
};

// [POST] /api/v1/user/login
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    const user = await User.findOne({
      email,
      deleted: false,
    });
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "Email hoặc mật khẩu không chính xác!",
      });
    }

    if (user.status === "initial") {
      return res.status(400).json({
        code: 400,
        message: "Tài khoản của bạn chưa được kích hoạt. Vui lòng xác thực!",
      });
    }

    if (user.status === "forgot") {
      return res.status(400).json({
        code: 400,
        message: "Bạn đã nhập sai mật khẩu quá nhiều lần. Vui lòng xác thực!",
      });
    }

    if (user.status === "inactive") {
      res.status(400).json({
        code: 400,
        message: "Tài khoản của bạn bị khóa tạm thời. Vui lòng thử lại sau!",
      });
    }

    // Kiểm tra mật khẩu
    const hashedPassword = md5(password);
    if (user.password !== hashedPassword) {
      user.failedPasswordCount = (user.failedPasswordCount || 0) + 1;
      await user.save();
      if (user.failedPasswordCount === 5) {
        user.status = "forgot";
        await user.save();
        return res.status(400).json({
          code: 400,
          message:
            "Bạn đã nhập sai mật khẩu quá 5 lần! Vui lòng nhập OTP để đặt lại mật khẩu",
        });
      }
      return res.status(400).json({
        code: 400,
        message: "Email hoặc mật khẩu không chính xác!",
      });
    }
    user.failedPasswordCount = 0;
    await user.save();

    const cart = await Cart.findOne({ userId: user._id });

    if (user.isTwoFa) {
      return res.status(200).json({
        code: 200,
        message: "Mật khẩu chính xác. Yêu cầu xác thực giọng nói.",
        requireTwoFa: true,
        userId: user._id,
      });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Trả về thông tin user (ẩn password)
    const { password: _, ...userData } = user.toObject();
    res.status(200).json({
      code: 200,
      message: "Đăng nhập thành công!",
      user: userData,
      token,
      cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi đăng nhập!",
    });
  }
};

module.exports.verifyVoice = async (req, res) => {
  try {
    const { email } = req.body; // từ formData
    const voiceFile = req.file; // file audio từ FE

    console.log("🚀 ~ email:", email);
    console.log("🚀 ~ voiceFile:", voiceFile);

    if (!voiceFile) {
      return res
        .status(400)
        .json({ code: 400, message: "Chưa có file âm thanh!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ code: 404, message: "Không tìm thấy người dùng." });
    }

    // Giả lập verify
    const score = Math.random();
    console.log("🚀 ~ score:", score);
    if (score < 0.01) {
      return res
        .status(401)
        .json({ code: 401, message: "Xác thực thất bại", score });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const { password: _, ...userData } = user.toObject();

    res.status(200).json({
      code: 200,
      message: "Xác thực thành công!",
      user: userData,
      token,
      score,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Lỗi xác thực giọng nói." });
  }
};

// [POST] /api/v1/user/password/forgot
module.exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const exceedingLoginFail = req.body.exceedingLoginFail;

    const user = await User.findOne({
      email: email,
      deleted: false,
    });

    if (!user) {
      return res.json({
        code: 400,
        message: "Email không tồn tại hoặc chưa được đăng ký!",
      });
    }

    const recentVerifications = await ForgotPassword.find({
      email: email,
      expireAt: { $gt: new Date(Date.now() - 3 * 60 * 1000) },
    });

    if (recentVerifications.length >= 3) {
      if (exceedingLoginFail) {
        user.lockedBy = "exceedingLoginFail"; // Cập nhật nguồn khóa
      } else {
        user.lockedBy = "passwordForgot"; // Cập nhật nguồn khóa
      }
      user.status = "inactive";
      user.lockedUntil = new Date(Date.now() + 3 * 60 * 1000);
      await user.save();

      return res.status(400).json({
        code: 400,
        message:
          "Quá nhiều yêu cầu OTP. Tài khoản của bạn đã bị khóa trong 3 phút.",
      });
    }

    const secretKey = process.env.SECRET_KEY_TOTP; // Khóa bí mật (nên lưu trữ an toàn, ví dụ trong file .env)
    const otp = generateHelper.generateTOTP(secretKey, 30, 6); // Tạo OTP với timeStep 30 giây, 6 chữ số

    const objectForgotPassword = {
      email: email,
      otp: otp,
      expireAt: new Date(Date.now() + 180 * 1000),
    };
    const forgotPassword = new ForgotPassword(objectForgotPassword);
    // console.log(objectForgotPassword);
    await forgotPassword.save();

    // Gửi OTP
    const subject = `Mã xác thực OTP đặt lại mật khẩu`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #004FA8; color: white; padding: 20px; text-align: center; font-size: 22px; font-weight: bold;">
                Xác Thực OTP
            </div>
            <div style="padding: 20px; line-height: 1.6;">
                <p style="font-size: 16px; color: #333;">Xin chào,</p>
                <p style="font-size: 16px; color: #333;">Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình. Dưới đây là mã OTP để xác thực yêu cầu:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 28px; font-weight: bold; color: #004FA8; background-color: #E6F4FF; padding: 15px 25px; border: 2px dashed #004FA8; border-radius: 8px;">
                        ${otp}
                    </span>
                </div>
                <p style="font-size: 14px; color: #555;">
                    <b>Lưu ý:</b> Mã OTP này chỉ có hiệu lực trong vòng <b>3 phút</b>. Không chia sẻ mã này với bất kỳ ai để đảm bảo an toàn tài khoản.
                </p>
                <p style="font-size: 14px; color: #555;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
                <p style="font-size: 14px; color: #555;">Trân trọng,<br><span style="color: #004FA8; font-weight: bold;">Top Ten Travel - Vòng quanh thế giới</span></p>
            </div>
            <div style="background-color: #004FA8; text-align: center; padding: 15px; font-size: 12px; color: #fff;">
                Email này được gửi từ hệ thống của Top Ten Travel. Nếu không phải bạn thực hiện yêu cầu, vui lòng liên hệ ngay với chúng tôi.
            </div>
        </div>
    `;

    sendMailHelper.sendMail(email, subject, html);

    res.json({
      code: 200,
      message: "OTP đã được gửi về email của bạn",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Có lỗi xảy ra!",
    });
  }
};

// [POST] /api/v1/user/password/otp
module.exports.otpPassword = async (req, res) => {
  try {
    const otp = req.body.otp;
    const email = req.body.email;

    const verifyOtp = await ForgotPassword.findOne({
      email: email,
    }).sort({ createdAt: -1 });

    if (!verifyOtp || verifyOtp.otp !== otp) {
      return res.status(400).json({
        code: 400,
        message: "OTP không hợp lệ",
      });
    }

    await ForgotPassword.deleteMany({ email: email });

    const user = await User.findOne({
      email: email,
    });
    if (user.status !== "active") {
      user.status = "active";
    }
    user.failedPasswordCount = 0;
    await user.save();

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Trả về thông tin user (ẩn password)
    const { password: _, ...userData } = user.toObject();

    res.status(200).json({
      code: 200,
      message: "Xác thực OTP thành công. Vui lòng đặt lại mật khẩu!",
      token,
      user: userData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi máy chủ!",
    });
  }
};

// [DELETE] /api/v1/user/password/delete-otp/:email
module.exports.deleteAllVerifyOtp = async (req, res) => {
  try {
    const email = req.params.email;
    await VerifyUser.deleteMany({ email: email });
    res.status(200).json({
      code: 200,
      message: "Đã xóa OTP!",
    });
  } catch {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi máy chủ khi xóa OTP!",
    });
  }
};

// [DELETE] /api/v1/user/password/delete-otp/:email
module.exports.deleteAllOtp = async (req, res) => {
  try {
    const email = req.params.email;
    await ForgotPassword.deleteMany({ email: email });
    res.status(200).json({
      code: 200,
      message: "Đã xóa OTP!",
    });
  } catch {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi máy chủ khi xóa OTP!",
    });
  }
};

// [PATCH] /api/v1/user/password/reset
module.exports.resetPassword = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        code: 400,
        message: "Mật khẩu xác nhận không trùng khớp!",
      });
    }

    // Kiểm tra xem có token trong header không
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        code: 401,
        message: "Token không hợp lệ!",
      });
    }

    const token = authHeader.split(" ")[1];

    // Xác thực token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Xác thực token
    } catch (error) {
      return res.status(401).json({
        code: 401,
        message: "Token không hợp lệ hoặc đã hết hạn!",
      });
    }

    // Lấy thông tin người dùng từ token
    const userId = decoded.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "Người dùng không tồn tại!",
      });
    }

    const hashedPassword = md5(password);

    if (user.password === hashedPassword) {
      return res.status(400).json({
        code: 400,
        message: "Mật khẩu mới không được trùng với mật khẩu cũ!",
      });
    }

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      code: 200,
      message: "Đặt lại mật khẩu thành công! Đăng nhập để tiếp tục",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi đặt lại mật khẩu",
    });
  }
};

// [GET] /api/v1/user/profile
module.exports.profile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findOne({
      _id: userId,
    }).select("-password");
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "Người dùng không tồn tại",
      });
    }

    res.status(200).json({
      code: 200,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi máy chủ",
    });
  }
};

// [GET] /api/v1/user/order-statistic
module.exports.orderStatistic = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({
      userId,
      deleted: false,
    });

    const totalUnpaidOrder = orders.filter((o) => !o.isPaid).length;
    const totalPaidOrder = orders.filter((o) => o.isPaid).length;

    const unpaidOrderPercentage = (
      (totalUnpaidOrder / (totalUnpaidOrder + totalPaidOrder)) *
      100
    ).toFixed(2);

    const paidOrderPercentage = (
      (totalPaidOrder / (totalUnpaidOrder + totalPaidOrder)) *
      100
    ).toFixed(2);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const startDate = new Date(currentYear, currentMonth - 6, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    const lastSixMonthOrders = orders.filter((o) => {
      const created = new Date(o.createdAt);
      return o.isPaid && created >= startDate && created <= endDate;
    });

    const lastSixMonthSpend = [];
    for (let i = 6; i >= 1; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const key = `${date.getMonth() + 1}-${date.getFullYear()}`;

      const monthOrders = lastSixMonthOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return (
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear()
        );
      });

      const totalSpend = monthOrders.reduce(
        (sum, o) => sum + (o.totalPrice || 0),
        0
      );

      lastSixMonthSpend.push({
        month: key,
        totalSpend,
      });
    }

    res.status(200).json({
      code: 200,
      orderPercentage: {
        unpaidOrderPercentage,
        paidOrderPercentage,
      },
      monthlySpend: lastSixMonthSpend,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi máy chủ",
    });
  }
};

// [PATCH] /api/v1/user/change-password
module.exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;
    const user = await User.findOne({
      _id: userId,
      deleted: false,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "Người dùng không tồn tại",
      });
    }
    if (md5(oldPassword) !== user.password) {
      return res.status(400).json({
        code: 400,
        message: "Mật khẩu không hợp lệ",
      });
    }
    if (md5(newPassword) === user.password) {
      return res.status(400).json({
        code: 400,
        message: "Mật khẩu mới không được dùng với mật khẩu cũ",
      });
    }
    await User.updateOne(
      {
        _id: userId,
      },
      {
        $set: {
          password: md5(newPassword),
        },
      }
    );
    res.status(200).json({
      code: 200,
      message: "Cập nhật mật khẩu thành công",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: 500,
      message: "Lỗi máy chủ",
    });
  }
};

// [PATCH] /api/v1/user/edit-info
module.exports.editInfo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findOne({
      _id: userId,
      deleted: false,
    }).select("-password");
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "Người dùng không tồn tại",
      });
    }
    const { phone } = req.body;
    const existPhone = await User.findOne({
      _id: {
        $ne: userId,
      },
      phone,
    });
    if (existPhone) {
      return res.status(400).json({
        code: 400,
        message: "Số điện thoại đã được sử dụng bởi tài khoản khác",
      });
    }
    await User.updateOne(
      {
        _id: userId,
      },
      req.body
    );
    res.status(200).json({
      code: 200,
      message: "Cập nhật thông tin thành công",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: 500,
      message: "Lỗi máy chủ",
    });
  }
};

// cron.schedule("*/1 * * * *", async () => {
//   const now = new Date();

//   // Cập nhật tài khoản bị khóa trong 3 phút, chuyển về "active" cho API passwordForgotPost
//   const resultForgot = await User.updateMany(
//     {
//       status: "inactive",
//       lockedUntil: { $lte: now },
//       lockedBy: "passwordForgot",
//     },
//     {
//       $set: { status: "active", lockedUntil: null, lockedBy: null },
//     }
//   );
//   if (resultForgot.modifiedCount > 0) {
//     console.log(
//       `[CRON] Đã mở khóa ${resultForgot.modifiedCount} tài khoản - API passwordForgotPost.`
//     );
//   }

//   // Cập nhật tài khoản bị khóa trong 3 phút, chuyển về "initial" cho API verifyEmailPost
//   const resultVerify = await User.updateMany(
//     {
//       status: "inactive",
//       lockedUntil: { $lte: now },
//       lockedBy: "verifyEmail",
//     },
//     {
//       $set: { status: "initial", lockedUntil: null, lockedBy: null },
//     }
//   );
//   if (resultVerify.modifiedCount > 0) {
//     console.log(
//       `[CRON] Đã chuyển trạng thái ${resultVerify.modifiedCount} tài khoản về "initial" - API verifyEmailPost.`
//     );
//   }

//   const resultExceedingLoginFail = await User.updateMany(
//     {
//       status: "inactive",
//       lockedUntil: { $lte: now },
//       lockedBy: "exceedingLoginFail",
//     },
//     {
//       $set: { status: "forgot", lockedUntil: null, lockedBy: null },
//     }
//   );
//   if (resultExceedingLoginFail.modifiedCount > 0) {
//     console.log(
//       `[CRON] Đã mở khóa ${resultExceedingLoginFail.modifiedCount} tài khoản - API exceedingLoginFail.`
//     );
//   }
// });
