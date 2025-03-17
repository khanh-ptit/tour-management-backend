const User = require("../../models/user.model");
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
