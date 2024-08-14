const User = require("../../models/user");
const wallet = require("../../models/wallet");
const bcrypt = require("bcrypt");
const { handleException } = require("../../helpers/exception");
const Response = require("../../helpers/response");
const Constant = require("../../helpers/constant");
const ProfileValidation = require("../../helpers/joi-validation");
const { ObjectId } = require("mongoose").Types;
const mongoose = require("mongoose");
const _ = require("underscore");
/**
 * Get user details
 */
const getUserProfile = async (req, res) => {
	const { logger } = req;
	try {
		const { userId } = req.decoded;
		const userDetails = await User.aggregate([
			{ $match: { _id: ObjectId(userId) } },
			{
				$lookup: {
					from: "cities",
					localField: "city",
					foreignField: "_id",
					as: "cities",
				},
			},
			{
				$unwind: { path: "$cities", preserveNullAndEmptyArrays: true },
			},
			{
				$project: {
					_id: 0,
					userId: "$_id",
					firstName: 1,
					lastName: 1,
					name: "$firstName $lastName",
					type: 1,
					company: 1,
					userName: {
						$ifNull: ["$userName", null],
					},
					city: "$cities",
					mobile: "$email.mobile",
					emailId: "$email.id",
					profilePicture: 1,
					secondaryEmailId: "$email.secondaryEmail",
					isPrivate: 1,
					registrationType: "$email.registrationType",
					walletAmount: 1,
					PropertyType: 1,
				},
			},
		]);

		if (!userDetails) {
			const obj = {
				res,
				status: Constant.STATUS_CODE.BAD_REQUEST,
				msg: Constant.INFO_MSGS.NO_DATA,
			};
			return Response.error(obj);
		} else {
			const obj = {
				res,
				msg: Constant.INFO_MSGS.SUCCESS,
				status: Constant.STATUS_CODE.OK,
				data: userDetails,
			};
			return Response.success(obj);
		}
	} catch (error) {
		console.log("error", error);
		return handleException(logger, res, error);
	}
};

/**
 * Update user details
 */
const updateUserProfile = async (req, res) => {
	const { logger } = req;
	try {
		const { userId } = req.decoded;
		const { firstName, lastName, company, mobile, secondaryEmailId, type, city } =
			req.body;
		const { error } = ProfileValidation.updateUserProfile(req.body);
		if (error) {
			const obj = {
				res,
				status: Constant.STATUS_CODE.BAD_REQUEST,
				msg: error.details[0].message,
			};
			return Response.error(obj);
		}
		const userDetails = await User.findOneAndUpdate(
			{ _id: userId },
			{
				$set: {
					firstName: firstName,
					lastName: lastName,
					company: company,
					"email.mobile": mobile,
					"email.secondaryEmail": secondaryEmailId,
					type: type,
					city: city,
				},
			},
			{ new: true }
		);
		const obj = {
			res,
			status: Constant.STATUS_CODE.OK,
			msg: Constant.INFO_MSGS.SUCCESSFUL_UPDATE,
			data: { emailId: userDetails.email.id, name: userDetails.name },
		};
		return Response.success(obj);
	} catch (error) {
		return handleException(logger, res, error);
	}
};

/**
 * Change the customer password in profile
 * @param {string} currentPassword
 * @param {string} newPassword
 */
const changePassword = async (req, res) => {
	const { logger } = req;
	try {
		const { userId } = req.decoded;

		const { error } = ProfileValidation.validateChangePassword(req.body);
		if (error) {
			const obj = {
				res,
				status: Constant.STATUS_CODE.BAD_REQUEST,
				msg: error.details[0].message,
			};
			return Response.error(obj);
		}

		const { currentPassword, newPassword } = req.body;

		const user = await User.findById({ _id: userId });

		if (user.email.registrationType !== "Email") {
			const obj = {
				res,
				msg: Constant.ERROR_MSGS.CHANGE_PASSWORD_NOT_ALLOWED,
				status: Constant.STATUS_CODE.BAD_REQUEST,
			};
			return Response.error(obj);
		}
		if (!bcrypt.compareSync(currentPassword, user.email.password)) {
			const obj = {
				res,
				status: Constant.STATUS_CODE.BAD_REQUEST,
				msg: Constant.ERROR_MSGS.INCORRECT_PASSWORD,
			};
			return Response.error(obj);
		}
		if (bcrypt.compareSync(newPassword, user.email.password)) {
			const obj = {
				res,
				status: Constant.STATUS_CODE.BAD_REQUEST,
				msg: Constant.ERROR_MSGS.OLD_PASSWORD,
			};
			return Response.error(obj);
		}
		const passHash = bcrypt.hashSync(newPassword, 10);
		await User.findByIdAndUpdate(
			{
				_id: userId,
			},
			{
				"email.password": passHash,
			},
			{
				new: true,
			}
		);
		const obj = {
			res,
			msg: Constant.INFO_MSGS.PASSWORD_CHANGED,
			status: Constant.STATUS_CODE.OK,
		};
		return Response.success(obj);
	} catch (error) {
		console.log("error change password", error);
		return handleException(logger, res, error);
	}
};

const walletTransaction = async (req, res) => {
	const { logger } = req;
	try {
		const { userId } = req.decoded;
		let { sortBy, offset, limit } = req.query;
		if (sortBy === "recent") {
			sortBy = { createdAt: -1 };
		} else {
			sortBy = { createdAt: 1 };
		}
		offset = offset || 1;
		limit = limit || 20;
		const skip = limit * (offset - 1);

		let getData = await wallet.aggregate([
			{
				$match: { userId: ObjectId(userId) },
			},
			{ $sort: sortBy },
			{
				$facet: {
					paginatedResult: [
						{ $skip: skip },
						{ $limit: parseInt(limit) },
					],
					totalCount: [{ $count: "count" }],
				},
			},
		]);

		if (_.isEmpty(getData[0].paginatedResult)) {
			obj = {
				res,
				status: Constant.STATUS_CODE.OK,
				msg: Constant.INFO_MSGS.TRAN_NOT_AVAILABLE,
				data: {
					items: [],
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
				transaction: getData[0].paginatedResult,
				pagination: {
					offset: parseInt(offset),
					limit: parseInt(limit),
					total: getData[0].totalCount[0].count,
				},
			},
		};
		return Response.success(obj);
	} catch (error) {
		console.log("error", error);
		return handleException(logger, res, error);
	}
};

module.exports = {
	getUserProfile,
	updateUserProfile,
	changePassword,
	walletTransaction,
};
