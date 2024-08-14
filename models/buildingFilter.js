const { Schema, model } = require("mongoose");
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;


const buildingFilterSchema = new Schema(
    {
        searchName: {
            type: String,
            trim: true,
            default: null
        },
        userId: {
            type: ObjectId,
            required: true,
            index: true,
        },
        MinRental: {
            type: Number,
            default: null,

        },
        MaxRental: {
            type: Number,
            default: null,

        },
        FloorMinSize: {
            type: Number,
            default: null,
        },
        FloorMaxSize: {
            type: Number,
            default: null,

        },
        status: {
            type: String,
            default: null,
        }
    },
    { timestamps: true }
);

module.exports = model("buildingFilter", buildingFilterSchema);