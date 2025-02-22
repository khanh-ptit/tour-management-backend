const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Tên dịch vụ
    description: { type: String }, // Mô tả (tuỳ chọn)
    price: { type: Number, default: 0 }, // Giá dịch vụ (nếu có)
    deleted: { type: Boolean, default: false }, // Xóa mềm
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema, "services");

module.exports = Service;
