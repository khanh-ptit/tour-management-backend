const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["available", "booked", "maintenance"],
      default: "available",
    },
    price: { type: Number, required: true },
    capacity: { type: Number, required: true },
    images: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    description: { type: String, required: true },
    slug: { type: String, slug: "name", unique: true },
    deleted: { type: Boolean, default: false },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }], // Tham chiếu đến Booking
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema, "rooms");

module.exports = Room;
