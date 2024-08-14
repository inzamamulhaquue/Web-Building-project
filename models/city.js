const { Schema, model } = require("mongoose");
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const citySchema = new Schema(
    {
        city: {
            type: String,
            default: 1,
        },
        lat: {
            type: String,
            default: 1,
        },
        lng: {
            type: String,
            default: 1,
        },
        country: {
            type: String,
            default: 1,
        },
        iso2: {
            type: String,
            default: 1,
        },
        admin_name: {
            type: String,
            default: 1,
        },
        capital: {
            type: String,
            default: 1,
        },
        population: {
            type: Number,
            default: 1,
        },
        population_proper: {
            type: Number,
            default: 1,
        },
        state:{
            type: String,
            default: null,
        },
        stateId:{
            type: ObjectId,
        }
    },
    { timestamps: true }
);

module.exports = model("city", citySchema);