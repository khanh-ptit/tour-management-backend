const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const tourCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Tên danh mục
    slug: { type: String, slug: "name", unique: true }, // Slug tự động từ name
    description: { type: String }, // Mô tả danh mục
    thumbnail: { type: String }, // Ảnh đại diện danh mục
    deleted: { type: Boolean, default: false }, // Xóa mềm
  },
  { timestamps: true }
);

const TourCategory = mongoose.model(
  "TourCategory",
  tourCategorySchema,
  "tour-categories"
);

module.exports = TourCategory;
