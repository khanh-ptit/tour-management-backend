const Account = require("../../models/account.model");
const md5 = require("md5");

// [GET] /api/v1/admin/my-account/info
module.exports.info = async (req, res) => {
  try {
    const id = req.user.id;
    const account = await Account.findOne({
      deleted: false,
      _id: id,
    })
      .select("-password")
      .populate("roleId", "title permissions");
    return res.status(200).json({
      code: 200,
      account,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi máy chủ",
    });
  }
};

// [PATCH] /api/v1/admin/my-account/change-password
module.exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const account = await Account.findOne({
      _id: req.user.id,
      deleted: false,
    });
    if (!account) {
      return res.status(404).json({
        code: 404,
        message: "Người dùng không tồn tại",
      });
    }
    if (account.password !== md5(oldPassword)) {
      return res.status(400).json({
        code: 400,
        message: "Mật khẩu không hợp lệ",
      });
    }
    if (account.password === md5(newPassword)) {
      return res.status(400).json({
        code: 400,
        message: "Mật khẩu mới không được trùng với mật khẩu cũ",
      });
    }
    await Account.updateOne(
      {
        _id: account._id,
      },
      {
        $set: {
          password: md5(newPassword),
        },
      }
    );
    res.status(200).json({
      code: 200,
      message: "Cập nhật thành công mật khẩu",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      code: 500,
      message: "Lỗi máy chủ",
    });
  }
};

// [PATCH] /api/v1/admin/my-account/edit
module.exports.editInfo = async (req, res) => {
  try {
    console.log(req.body);
    const { fullName, phone, avatar } = req.body;
    const existPhone = await Account.findOne({
      _id: {
        $ne: req.user.id,
      },
      phone,
      deleted: false,
    });
    if (existPhone) {
      return res.status(400).json({
        code: 400,
        message: "Số điện thoại đã được sử dụng",
      });
    }
    const account = await Account.updateOne(
      {
        _id: req.user.id,
      },
      req.body
    );
    res.status(200).json({
      code: 200,
      message: "Cập nhật thông tin thành công",
      account: {
        fullName: account.fullName,
        avatar: account.avatar,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      code: 500,
      message: "Lỗi máy chủ",
    });
  }
};
