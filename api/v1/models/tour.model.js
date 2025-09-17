const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const tourSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, slug: "name", unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    servicesPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    duration: { type: String, required: true },
    departureDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "TourCategory" },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
    },
    images: { type: [String], default: [] },
    services: { type: [mongoose.Schema.Types.ObjectId], ref: "Service" },
    deleted: { type: Boolean, default: false },
    status: {
      type: String,
      default: "active",
    },
    createdBy: {
      accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    updatedBy: [
      {
        accountId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    deletedBy: {
      accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
      deletedAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
);

const Tour = mongoose.model("Tour", tourSchema, "tours");

module.exports = Tour;
