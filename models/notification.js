let mongoose = require("mongoose");
let notificationSchema = mongoose.Schema(
	{
		title: {
			type: String,
			default: null,
		},
		message: {
			type: String,
			default: null,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		isRead: {
			type: Boolean,
			default: false,
		},
		buildingId: {
			type: mongoose.Types.ObjectId,
			default: null,
			ref: "buildings",
		},
		registryId: {
			type: mongoose.Types.ObjectId,
			default: null,
			ref: "transactions",
		},
		userId: {
			type: mongoose.Types.ObjectId,
			default: null,
			ref: "users",
		},
		adminId: {
			type: mongoose.Types.ObjectId,
			default: null,
			ref: "admins",
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("notification", notificationSchema);
