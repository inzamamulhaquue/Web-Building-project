const { Schema, model } = require("mongoose");
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const stateSchema = new Schema(
    {
        stateTitle: {
            type: String,
            default: null,
        },
        stateStatus: {
            type: Number,
            default: 1,
        },
        
    },
    { timestamps: true }
);

module.exports = model("state", stateSchema);