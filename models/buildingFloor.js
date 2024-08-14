const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const buildingFloor = new Schema(
  {
    buildingId: {
      type: ObjectId,
      default: null,
    },
    list: [
      {
        floor: {
          type: Number,
          default: null,
        },
        flat: [
          {
            transectionId: [{ type: ObjectId }],
            flatNo: {
              type: Number,
              default: null,
            },
            carpetArea: { type: Number, default: null },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("buildingFloor", buildingFloor);
