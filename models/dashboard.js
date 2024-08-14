const { Schema, model } = require("mongoose");
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const dashboardSchema = new Schema(
    {
        cityId: {
            type: ObjectId,
            default: null,
        },
        data: {
            buildings: {
                type: Number,
                default: 0
            },
            transactions: {
                type: Number,
                default: 0
            },
            totalRegistryAmount: {
                type: Number,
                default: 0
            },
            totalSquareFeet: {
                type: Number,
                default: 0
            }
        }
    },
    { timestamps: true }
);

module.exports = model("dashboard", dashboardSchema);