const { handleException } = require("../../helpers/exception");
const Response = require("../../helpers/response");
const Constant = require("../../helpers/constant");
const notification = require("../../models/notification");
const _ = require("underscore");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const getAll = async (req, res) => {
	const { logger } = req;
	try {
		let { sortBy, str, page, limit } = req.query;
		const { userId } = req.decoded;
		if (_.isUndefined(str)) str = "";
		if (sortBy === "recent") {
			sortBy = { createdAt: 1 };
		} else {
			sortBy = { createdAt: -1 };
		}

		let qry = {};
		if (!_.isEmpty(str)) {
			qry["$or"] = [
				{ title: { $regex: str, $options: "i" } },
				{ message: { $regex: str, $options: "i" } },
			];
		}
		offset = page || 1;
		limit = limit || 20;
		const skip = limit * (offset - 1);
		const notificationData = await notification.aggregate([
			{
				$match: qry,
				$match: { userId: ObjectId(userId) },
			},
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "userData",
				},
			},
			{
				$unwind: { path: "$userData", preserveNullAndEmptyArrays: true },
			},
			{
				$lookup: {
					from: "buildings",
					localField: "buildingId",
					foreignField: "_id",
					as: "buildingData",
				},
			},
			{
				$unwind: { path: "$buildingData", preserveNullAndEmptyArrays: true },
			},
			{
				$project: {
					_id: 1,
					title: 1,
					message: 1,
					isDeleted: 1,
					isRead: 1,
					buildingId: 1,
					userId: 1,
					createdAt: 1,
					updatedAt: 1,
					buildingData: 1,
					userData: {
						name: "$userData.name",
						company: "$userData.company",
						type: "$userData.type",
						mobile: "$userData.email.mobile",
						email: "$userData.email.id",
					},
				},
			},
			{ $sort: sortBy },
			{
				$facet: {
					paginatedResult: [{ $skip: skip }, { $limit: parseInt(limit) }],
					totalCount: [{ $count: "count" }],
					unReadCount: [{ $match: { isRead: false } }, { $count: "count" }],
				},
			},
		]);

		if (_.isEmpty(notificationData[0].paginatedResult)) {
			obj = {
				res,
				status: Constant.STATUS_CODE.OK,
				msg: Constant.INFO_MSGS.NOTIFICATION_NOT_AVAILABLE,
				data: {
					data: [],
					pagination: {
						offset: parseInt(offset),
						limit: parseInt(limit),
						total: 0,
					},
				},
			};
			return Response.success(obj);
		}
		obj = {
			res,
			msg: Constant.INFO_MSGS.SUCCESS,
			status: Constant.STATUS_CODE.OK,
			data: {
				data: notificationData[0].paginatedResult,
				pagination: {
					offset: parseInt(offset),
					limit: parseInt(limit),
					total: notificationData[0].totalCount[0].count,
					unReadCount: notificationData[0].unReadCount[0]?.count,
				},
			},
		};

		return Response.success(obj);
	} catch (error) {
		console.log("error", error);
		return handleException(logger, res, error);
	}
};

const readById = async (req, res) => {
	const { logger } = req;

	try {
		const _id = req.params._id;

		let readData = await notification.findByIdAndUpdate(
			{ _id },
			{ isRead: true }
		);
		if (!readData) {
			const obj = {
				res,
				status: Constant.STATUS_CODE.BAD_REQUEST,
				msg: Constant.ERROR_MSGS.NOTIFICATION_NOT_FOUND,
			};
			return Response.error(obj);
		} else {
			const obj = {
				res,
				msg: Constant.INFO_MSGS.READ_SUCCESSFULLY,
				status: Constant.STATUS_CODE.OK,
				data: readData,
			};
			return Response.success(obj);
		}
	} catch (error) {
		console.log("error", error);
		return handleException(logger, res, error);
	}
};

const addOnUpdate = async (data) => {
	try {
		const { title, message, buildingId, adminId } = data;
		for (let i = 0; i < adminId.length; i++) {
			const saveData = await notification.create({
				title,
				message,
				buildingId: buildingId ? buildingId : null,
				adminId: adminId ? adminId[i] : null,
			});
			if (!saveData) {
				console.log("Requirement notification could not be added!!");
			} else {
				console.log("Requirement notification added successfully!!");
			}
		}
	} catch (error) {
		console.log("error", error);
	}
};

module.exports = {
	getAll,
	readById,
	addOnUpdate,
};
