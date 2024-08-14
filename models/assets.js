const { Schema, model } = require("mongoose");
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const AssetsSchema = new Schema(
      {
            url: {
                  type: String,
                  default: null,
            },
            id: {
                  type: ObjectId,
            },
            type: {
                  type: String,
                  default: 'image',
            },
            originalName: {
                  type: String,
                  default: null
            }
      },
      { timestamps: true }
);

module.exports = model("assets", AssetsSchema);