const Account = require("../../models/account.model");
const md5 = require("md5");

// [GET] /api/v1/admin/accounts
module.exports.index = async (req, res) => {
  try {
    let find = { deleted: false };
    let sort = {};
    if (req.query.status) {
      find.status = req.query.status;
    }
    if (req.query.name) {
      find.fullName = new RegExp(req.query.name, "i");
    }
    const { sortKey, sortValue, page = 1, limit = 4 } = req.query;
    if (sortKey && sortValue) {
      sort[`${sortKey}`] = sortValue;
    } else {
      sort.createdAt = 1;
    }

    const skip = (page - 1) * limit;

    const accounts = await Account.find(find)
      .populate({
        path: "roleId",
        select: "title",
      })
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Account.countDocuments(find);
    res.status(200).json({
      accounts,
      total,
    });
  } catch (error) {
    console.error("Đã xảy ra lỗi khi lấy danh sách tài khoản", error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy danh sách tài khoản",
    });
  }
};

// [POST] /api/v1/admin/account/create
module.exports.create = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const existEmail = await Account.findOne({
      email: email,
      deleted: false,
    });
    if (existEmail) {
      return res.status(400).json({
        code: 400,
        message: "Email đã tồn tại!",
      });
    }

    const existPhone = await Account.findOne({
      phone: phone,
      deleted: false,
    });
    if (existPhone) {
      return res.status(400).json({
        code: 400,
        message: "Số điện thoại đã tồn tại!",
      });
    }

    const createObj = { ...req.body, password: md5(req.body.password) };
    if (createObj.avatar == "") {
      delete createObj.avatar;
    }
    const newAccount = new Account(createObj);
    await newAccount.save();
    res.status(201).json({
      code: 201,
      message: "Tạo thành công tài khoản",
    });
  } catch (error) {
    console.error("Đã xảy ra lỗi khi tạo tài khoản", error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi tạo tài khoản",
    });
  }
};

// [DELETE] /api/v1/admin/account/delete
module.exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findOne({ _id: id, deleted: false });
    if (!account) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy tài khoản",
      });
    }
    await Account.findByIdAndUpdate(id, { deleted: false });
    res.status(200).json({
      code: 200,
      message: "Đã xóa tài khoản",
    });
  } catch (error) {
    console.error("Đã xảy ra lỗi khi lấy danh sách tài khoản");
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy danh sách tài khoản",
    });
  }
};

// [GET] /api/v1/admin/account/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findOne({
      _id: id,
      deleted: false,
    }).populate({
      path: "roleId",
    });
    if (!account) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy thông tin tài khoản",
      });
    }
    res.status(200).json({
      code: 200,
      account,
    });
  } catch (error) {
    console.error("Đã xảy ra lỗi khi lấy thông tin tài khoản", error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy thông tin tài khoản",
    });
  }
};

// [PATCH] /api/v1/admin/account/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, phone } = req.body;

    const existEmail = await Account.findOne({
      email: email,
      _id: {
        $ne: id,
      },
    });

    if (existEmail) {
      return res.status(400).json({
        code: 400,
        message: "Email đã được sử dụng bởi tài khoản khác!",
      });
    }

    const existPhone = await Account.findOne({
      phone: phone,
      _id: {
        $ne: id,
      },
    });

    if (existPhone) {
      return res.status(400).json({
        code: 400,
        message: "Số tài khoản đã được sử dụng bởi tài khoản khác!",
      });
    }

    const updateObj = { ...req.body };
    if (req.body.password) {
      updateObj.password = md5(req.body.password);
    }
    const account = await Account.findOne({
      _id: id,
      deleted: false,
    });
    if (!account) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy thông tin tài khoản",
      });
    }
    await Account.updateOne(
      {
        _id: id,
      },
      updateObj
    );
    res.status(200).json({
      code: 200,
      message: "Cập nhật thành công tài khoản",
    });
  } catch (error) {
    console.error("Đã xảy ra lỗi khi chỉnh sửa tài khoản", error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi chỉnh sửa tài khoản",
    });
  }
};
