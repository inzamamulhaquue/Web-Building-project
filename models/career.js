const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const careerSchema = new Schema(
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
    location: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    resume_cv: [{
      type: String,
      default: null,
    }],
  },
  { timestamps: true }
);

module.exports = model("career", careerSchema);
