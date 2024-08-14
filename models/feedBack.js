const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const feedBackSchema = new Schema(
  {
    firstName: {
      type: String,
      default: null,
    },
    lastName: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default:null,
    },
    mobile: {
      type: Number,
      default: null
    },
    feedBack: {
      type: String,
      default: null,
    },
    images: [{
        type: String,
        default: null,
    }],
  },
  { timestamps: true }
);

module.exports = model("feedBack", feedBackSchema);
