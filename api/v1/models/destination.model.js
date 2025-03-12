const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    slug: { type: String, slug: "name", unique: true },
    thumbnail: { type: String },
    deleted: { type: Boolean, default: false }, // Xóa mềm
  },
  { timestamps: true }
);

const Destination = mongoose.model(
  "Destination",
  destinationSchema,
  "destinations"
);

module.exports = Destination;
