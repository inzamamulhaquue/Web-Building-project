const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const newBuildingFloor = new Schema(
    {

        floorNo: {
            type: String,
            default: null,
            trim: true,
            require: true,
        },

        floorDetails: {
            type: String,
            default: null,
            trim: true
        },

        flatNo: {
            type: String,
            default: null,
            trim: true,
            require: true,
        },
    
        carpetArea: {
            type: String,
            default: null,
            trim: true
        },

        refugeArea: {
            type: String,
            default: null,
            trim: true
        },

        chargeable: {
            type: String,
            default: null,
            trim: true
        },

        buildingId: {
            type: ObjectId,
            default: null,
            trim: true
        },

        registryId: {
            type: ObjectId,
            default: null,
            trim: true
        },

        expiryDate: {
            type: Date,
            default: null
        },

        documentType: {
            type: String,
            default: null
        },

        unitStatus: {
            type: String,
            default: null
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "admins",
            default: null,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "admins",
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = model("newbuildingFloor", newBuildingFloor);
