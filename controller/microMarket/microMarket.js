const { handleException } = require("../../helpers/exception");
const Response = require("../../helpers/response");
const Constant = require("../../helpers/constant");
const microMarketModel = require("../../models/newMicroMarket");
const MicroMarket = require('../../models/microMarket');
const { default: mongoose } = require("mongoose");
const _ = require("underscore");

//this is to get all newMicroMarket collection
const getAllMicroMarket = async (req, res) => {
	const { logger } = req;
	try {
		let { sortBy, str, page, limit, state, city , microMarketTitle , locality ,microMarketId} = req.query;
		if (_.isUndefined(str)) str = "";
		if (sortBy === "recent") {
			sortBy = { createdAt: -1 };
		} else {
			sortBy = { createdAt: 1 };
		}
		let qry = {};
		// if (str) {
		// 	qry["$or"] = [{ microMarketTitle: { $regex: str, $options: "i" } }];
		// }
		if (locality) {
			qry["$and"] = qry["$and"]
			  ? [...qry["$and"], { locality: { $regex: locality, $options: "i" } }]
			  : [{ locality: { $regex: locality, $options: "i" } }];
		  }
	    if (microMarketTitle) {
			qry["$and"] = qry["$and"]
			? [...qry["$and"], { microMarketTitle: { $regex: microMarketTitle, $options: "i" } }]
			: [{ microMarketTitle: { $regex: microMarketTitle, $options: "i" } }];
		}
		if (microMarketId) {
			qry["$and"] = qry["$and"]
				? [...qry["$and"], { microMarketId: mongoose.Types.ObjectId(microMarketId) }]
				: [{ microMarketId: mongoose.Types.ObjectId(microMarketId) }];
		}

		if (city) {
			qry["$and"] = qry["$and"]
				? [...qry["$and"], { city: mongoose.Types.ObjectId(city) }]
				: [{ city: mongoose.Types.ObjectId(city) }];
		}
	  
		offset = page || 1;
		limit = limit || 20;
		const skip = limit * (offset - 1);
		const MicroMarketData = await microMarketModel.aggregate([
			{
				$match: qry,
			},
			{ $sort: sortBy },
			{
				$facet: {
					paginatedResult: [{ $skip: skip }, { $limit: parseInt(limit) }],
					totalCount: [{ $count: "count" }],
				},
			},
		]);
		if (_.isEmpty(MicroMarketData[0].paginatedResult)) {
			obj = {
				res,
				status: Constant.STATUS_CODE.OK,
				msg: Constant.INFO_MSGS.ITEMS_NOT_AVAILABLE,
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
				data: MicroMarketData[0].paginatedResult,
				pagination: {
					offset: parseInt(offset),
					limit: parseInt(limit),
					total: MicroMarketData[0].totalCount[0].count,
				},
			},
		};

		return Response.success(obj);
	} catch (error) {
		console.log("error", error);
		return handleException(logger, res, error);
	}
};

const getMicroMarketByStateAndCity = async (req, res) => {
	const { logger } = req;
	try {
		let { sortBy, str, page, limit, state, city } = req.query;
		if (_.isUndefined(str)) str = "";
		if (sortBy === "recent") {
			sortBy = { createdAt: -1 };
		} else {
			sortBy = { createdAt: 1 };
		}

		let qry = { status: "ACTIVE" };
		if (str) {
			qry["$or"] = [{ microMarketTitle: { $regex: str, $options: "i" } }];
		}
		if (state) {
			qry["$and"] = qry["$and"]
				? [...qry["$and"], { state: mongoose.Types.ObjectId(state) }]
				: [{ state: mongoose.Types.ObjectId(state) }];
		}
		if (city) {
			qry["$and"] = qry["$and"]
				? [...qry["$and"], { city: mongoose.Types.ObjectId(city) }]
				: [{ city: mongoose.Types.ObjectId(city) }];
		}
		
		offset = page || 1;
		limit = limit || 20;
		const skip = limit * (offset - 1);
		const MicroMarketData = await microMarketModel.aggregate([
			{
				$match: qry,
			},
			{ $sort: sortBy },
			{
				$facet: {
					paginatedResult: [{ $skip: skip }, { $limit: parseInt(limit) }],
					totalCount: [{ $count: "count" }],
				},
			},
		]);
		if (_.isEmpty(MicroMarketData[0].paginatedResult)) {
			obj = {
				res,
				status: Constant.STATUS_CODE.OK,
				msg: Constant.INFO_MSGS.ITEMS_NOT_AVAILABLE,
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
				data: MicroMarketData[0].paginatedResult,
				pagination: {
					offset: parseInt(offset),
					limit: parseInt(limit),
					total: MicroMarketData[0].totalCount[0].count,
				},
			},
		};

		return Response.success(obj);
	} catch (error) {
		console.log("error", error);
		return handleException(logger, res, error);
	}
};

//this is to get all microMarket collection 
const getAllMicroMarketData = async (req, res) => {
	const { logger } = req;
	try {
		let { sortBy, str, page, limit, microMarketId, state, city} = req.query;
		if (_.isUndefined(str)) str = "";
		if (sortBy === "recent") {
			sortBy = { createdAt: -1 };
		} else {
			sortBy = { createdAt: 1 };
		}
		let qry = {};
		if (str) {
			qry["$or"] = [{ microMarketTitle: { $regex: str, $options: "i" } }];
		}
		if (microMarketId) {
			qry["$and"] = qry["$and"]
				? [...qry["$and"], { microMarketId: mongoose.Types.ObjectId(microMarketId) }]
				: [{ microMarketId: mongoose.Types.ObjectId(microMarketId) }];
		}
		if (state) {
			qry["$and"] = qry["$and"]
			  ? [...qry["$and"], { state: mongoose.Types.ObjectId(state) }]
			  : [{ state: mongoose.Types.ObjectId(state) }];
		  }
		  if (city) {
			qry["$and"] = qry["$and"]
			  ? [...qry["$and"], { city: mongoose.Types.ObjectId(city) }]
			  : [{ city: mongoose.Types.ObjectId(city) }];
		  }

		offset = page || 1;
		limit = limit || 20;
		const skip = limit * (offset - 1);
		const MicroMarketData = await MicroMarket.aggregate([
			{
				$match: qry,
			},
			{ $sort: sortBy },
			{
				$facet: {
					paginatedResult: [{ $skip: skip }, { $limit: parseInt(limit) }],
					totalCount: [{ $count: "count" }],
				},
			},
		]);
		if (_.isEmpty(MicroMarketData[0].paginatedResult)) {
			obj = {
				res,
				status: Constant.STATUS_CODE.OK,
				msg: Constant.INFO_MSGS.ITEMS_NOT_AVAILABLE,
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
				data: MicroMarketData[0].paginatedResult,
				pagination: {
					offset: parseInt(offset),
					limit: parseInt(limit),
					total: MicroMarketData[0].totalCount[0].count,
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
	getAllMicroMarket,
	getMicroMarketByStateAndCity,
	getAllMicroMarketData
};
