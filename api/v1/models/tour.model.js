const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const tourSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Tên tour
    slug: { type: String, slug: "name", unique: true }, // Slug tự động từ name
    description: { type: String }, // Mô tả tour
    price: { type: Number, required: true }, // Giá tour
    discountPercentage: { type: Number, default: 0 },
    servicesPrice: { type: Number, default: 0 }, // Tổng giá dịch vụ
    totalPrice: { type: Number, required: true }, // Giá cuối cùng = price + servicesPrice
    duration: { type: String, required: true }, // Thời gian diễn ra (VD: 3 ngày 2 đêm)
    departureDate: { type: Date, required: true }, // Ngày khởi hành
    returnDate: { type: Date, required: true }, // Ngày kết thúc
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "TourCategory" }, // Liên kết với danh mục tour
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
    }, // Liên kết với danh mục tour
    images: { type: [String], default: [] }, // Ảnh tour
    services: { type: [mongoose.Schema.Types.ObjectId], ref: "Service" }, // Các dịch vụ kèm theo
    deleted: { type: Boolean, default: false }, // Xóa mềm
    status: {
      type: String,
      default: "active",
    },
  },
  { timestamps: true }
);

const Tour = mongoose.model("Tour", tourSchema, "tours");

module.exports = Tour;
