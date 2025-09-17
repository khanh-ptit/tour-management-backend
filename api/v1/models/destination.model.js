const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    slug: { type: String, slug: "name", unique: true },
    thumbnail: { type: String },
    deleted: { type: Boolean, default: false },
    createdBy: {
      type: {
        accountId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
      default: null,
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
      type: {
        accountId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
        },
        deletedAt: {
          type: Date,
          default: Date.now,
        },
      },
      default: null,
    },
  },
  { timestamps: true }
);

const Destination = mongoose.model(
  "Destination",
  destinationSchema,
  "destinations"
);

module.exports = Destination;
