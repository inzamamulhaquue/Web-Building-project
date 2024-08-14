const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const pdfUploadSchema = new Schema(
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

module.exports = model("pdfUpload", pdfUploadSchema);
