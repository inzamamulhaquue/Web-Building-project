const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const agreementSchema = new Schema(
  {
    fullName: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    DocumentNo: {
      type: String,
      default: null,
    },
    DocumentName: {
      type: String,
      default: null,
    },
    city: {
      type: ObjectId,
      default: null,
    },
    state: {
      type: ObjectId,
      default: null,
    },
    microMarket: {
      type: ObjectId,
      default: null,
    },
    locality: {
      type: String,
      default: null,
    },
    userId: {
      type: ObjectId,
      required: true,
    },
    registryId: {
      type: ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = model("agreement", agreementSchema);
