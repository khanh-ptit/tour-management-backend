const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.model");
const generateHelper = require("../../../../helpers/generate");
const sendMailHelper = require("../../../../helpers/sendMail");
const md5 = require("md5");
const jwt = require("jsonwebtoken");

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

    // Tạo user mới
    const newUser = new User({ ...req.body, password: hashedPassword });
    await newUser.save();

    // Tạo JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      code: 201,
      message: "Đăng ký thành công. Đăng nhập để tiếp tục!",
      user: newUser,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Đã xảy ra lỗi khi đăng ký!" });
  }
};

// [POST] /api/v1/user/login
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email đã tồn tại
    const existEmail = await User.findOne({
      email,
      status: "active",
      deleted: false,
    });
    if (!existEmail) {
      return res
        .status(400)
        .json({ code: 400, message: "Email không hợp lệ hoặc không tồn tại!" });
    }

    // Tìm user theo email
    const user = await User.findOne({
      email,
      status: "active",
      deleted: false,
    });
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "Email hoặc mật khẩu không chính xác!",
      });
    }

    // Kiểm tra mật khẩu
    const hashedPassword = md5(password);
    if (user.password !== hashedPassword) {
      return res.status(400).json({
        code: 400,
        message: "Email hoặc mật khẩu không chính xác!",
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
      token, // Trả về token
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi đăng nhập!",
    });
  }
};

// [POST] /api/v1/user/password/forgot
module.exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const existEmail = await User.findOne({
      email: email,
      status: "active",
      deleted: false,
    });

    if (!existEmail) {
      return res.json({
        code: 400,
        message: "Email không tồn tại không hệ thống!",
      });
    }

    const otp = generateHelper.generateRandomNumber(6);
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

    // sendMailHelper.sendMail(email, subject, html);

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
      otp: otp,
    });
    if (!verifyOtp) {
      return res.status(400).json({
        code: 400,
        message: "OTP không hợp lệ",
      });
    }

    await ForgotPassword.deleteMany({ email: email });

    const user = await User.findOne({
      email: email,
    });

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // Token hết hạn sau 15 phút (đủ thời gian để đặt lại mật khẩu)
    );

    // Trả về thông tin user (ẩn password)
    const { password: _, ...userData } = user.toObject();
    // Trả về thông báo thành công cùng với token và user
    res.status(200).json({
      code: 200,
      message: "Xác thực OTP thành công. Vui lòng đặt lại mật khẩu!",
      token, // Trả về token
      user: userData, // Trả về thông tin user (không bao gồm mật khẩu)
    });
  } catch (error) {
    console.log(error);
  }
};

// [DELETE] /api/v1/user/password/delete-otp/:email
module.exports.deleteAllOtp = async (req, res) => {
  try {
    const email = req.params.email;
    await ForgotPassword.deleteMany({ email: email });
  } catch {
    console.log(error);
  }
};

// [PATCH] /api/v1/user/password/reset
module.exports.resetPassword = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { password, confirmPassword } = req.body; // Lấy dữ liệu từ body

    // Kiểm tra mật khẩu và xác nhận mật khẩu
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

    // Lấy token từ header
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
    const user = await User.findById(userId); // Tìm người dùng trong cơ sở dữ liệu

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "Người dùng không tồn tại!",
      });
    }

    // Hash mật khẩu mới
    const hashedPassword = md5(password);

    // Kiểm tra xem mật khẩu mới có trùng với mật khẩu cũ không
    if (user.password === hashedPassword) {
      return res.status(400).json({
        code: 400,
        message: "Mật khẩu mới không được trùng với mật khẩu cũ!",
      });
    }

    // Cập nhật mật khẩu mới vào cơ sở dữ liệu
    user.password = hashedPassword;
    await user.save();

    // Trả về thông báo thành công
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
