const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const microMarketSchema = new Schema(
      {
            microMarketTitle: {
                  type: String,
                  default: null,
            },
            microMarketId:{
                  type: ObjectId,
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
            locality: {
                  type: String,
                  default: null,
            },
            status: {
                  type: String,
                  enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
                  default: 'ACTIVE'
            }
      },
      { timestamps: true }
);

module.exports = model("newMicroMarket", microMarketSchema);
