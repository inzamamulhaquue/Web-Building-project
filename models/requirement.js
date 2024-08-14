const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const requirementSchema = new Schema(
	{
		fullName: {
			type: String,
			default: null,
		},
		userId: {
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
		microMarket: {
			type: ObjectId,
			default: null,
		},
		locality: {
			type: String,
			default: null,
		},
		remarks: {
			type: String,
			default: null,
		},
	},
	{ timestamps: true }
);

module.exports = model("requirement", requirementSchema);
