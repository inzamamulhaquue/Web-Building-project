const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const index2DownloadSchema = new Schema(
  {
    url: {
      type: String,
      default: null,
    },
    registryId: {
      type: ObjectId,
      required: true,
    }    
  },
  { timestamps: true }
);

module.exports = model("index2", index2DownloadSchema);