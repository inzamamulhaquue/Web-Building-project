const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const microMarketSchema = new Schema(
  {
    microMarketTitle: {
      type: String,
      default: null,
    },
    state: {
      type: ObjectId,
      default: null,
    },
    city: {
      type: ObjectId,
      default: null,
    },
    // list: [
    //   {
    //     pincode: {
    //       type: Number,
    //       default: null,
    //     },
    //     po: {
    //       type: String,
    //       default: null,
    //     },
    //   },
    // ],
  },
  { timestamps: true }
);

module.exports = model("microMarket", microMarketSchema);
