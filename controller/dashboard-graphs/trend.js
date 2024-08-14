const { handleException } = require("../../helpers/exception");
const registry = require("../../models/registry");
const Response = require("../../helpers/response");
const Constant = require("../../helpers/constant");
const { ObjectId } = require("mongoose").Types;
const momenttz = require("moment-timezone");
momenttz.tz("Asia/Kolkata");

const findTrendingLocalities = async (req, res) => {
	const { logger } = req;

	try {
		let { cityId, locality ,selectedType, to, from } = req.query;

		if (!cityId || !to || !from) {
			const obj = {
				res,
				status: Constant.STATUS_CODE.BAD_REQUEST,
				msg: `"cityId", "to" date and "from" date ${Constant.INFO_MSGS.MSG_REQUIRED} in query!`,
			};
			return Response.error(obj);
		}
		const userPropertyType = req.decoded.PropertyType;
		let qry = {};

		if (userPropertyType === "both" ) {
			if (selectedType === "commercial") {
				qry.buildingType = "commercial";
			} else if (selectedType === "residential") {
				qry.buildingType = "residential";
			}
		} else {
			qry.buildingType = userPropertyType;
		}

		qry = {
			...qry,
			archive: false,
		};

		// Subtract 5 years from the current date
		const fiveYearsAgo = new Date();
		fiveYearsAgo
			.setFullYear(fiveYearsAgo.getFullYear() - 5, 0, 1)
			.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
		fiveYearsAgo.setUTCHours(0, 0, 0, 0); // 00:00:00.000 UTC

		const toDate = new Date();
		toDate
			.setFullYear(toDate.getFullYear() - 0, 11, 31)
			.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
		toDate.setUTCHours(23, 59, 59, 999); // 23:59:59.999 UTC

		const currentYear = new Date().getFullYear();
		const range = (start, stop, step) =>
			Array.from(
				{ length: (stop - start) / step + 1 },
				(_, i) => start + i * step
			);
		const lastFiveYears = range(currentYear, currentYear - 5, -1);
		// lastFiveYears.shift();

		const topToDate = new Date(to);
		topToDate
			.setDate(topToDate.getDate() + 1)
			.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

		const topFromDate = new Date(from);
		topFromDate
			.setDate(topFromDate.getDate() + 1)
			.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });


		if (!locality) {
			locality = await registry.aggregate([
				{
					$match: {
						city: ObjectId(cityId),
						...qry,
						$expr: {
							$and: [
								{ $gte: ["$RegistrationDate", topFromDate] },
								{ $lte: ["$RegistrationDate", topToDate] },
							],
						}
					},
				},
				{
					$group: {
						_id: "$locality",
						sqf: { $sum: "$SquareFeet" },
					},
				},
				{
					$sort: {
						sqf: -1,
					},
				},
				{
					$limit: 3,
				},
			]);

			locality = locality.map((item) => item._id);
		} else {
			if (!Array.isArray(locality)) locality = [locality];
		}
		const data = await registry.aggregate([
			{
				$match: {
					city: ObjectId(cityId),
					locality: { $in: locality },
					...qry,
					$expr: {
						$and: [
							{ $gte: ["$RegistrationDate", fiveYearsAgo] },
							{ $lte: ["$RegistrationDate", toDate] },
						],
					},
				},
			},
			{
				$addFields: {
					year: { $year: "$RegistrationDate" },
				},
			},
			{
				$group: {
					_id: {
						locality: "$locality",
						year: "$year",
					},
					sqf: { $sum: "$SquareFeet" },
				},
			},
			{
				$group: {
					_id: "$_id.locality",
					yearsData: {
						$push: {
							year: "$_id.year",
							sqf: "$sqf",
						},
					},
				},
			},
			{
				$project: {
					_id: 0,
					name: "$_id",
					data: {
						$map: {
							input: lastFiveYears,
							as: "year",
							in: {
								$cond: [
									{ $in: ["$$year", "$yearsData.year"] },
									{
										$arrayElemAt: [
											"$yearsData.sqf",
											{ $indexOfArray: ["$yearsData.year", "$$year"] },
										],
									},
									0,
								],
							},
						},
					},
					//   year: lastFiveYears,
				},
			},
		]);

		const obj = {
			res,
			msg: Constant.INFO_MSGS.SUCCESS,
			status: Constant.STATUS_CODE.OK,
			data: {
				data,
				years: lastFiveYears,
			},
		};
		return Response.success(obj);
	} catch (error) {
		console.log(error);
		return handleException(logger, res, error);
	}
};

const findLocalitiesByPrice = async (req, res) => {
	const { logger } = req;

	try {
		let { cityId, locality, documentType = "Sale",selectedType, to, from } = req.query;

		if (!cityId || !to || !from) {
			const obj = {
				res,
				status: Constant.STATUS_CODE.BAD_REQUEST,
				msg: `"cityId", "to" date and "from" date ${Constant.INFO_MSGS.MSG_REQUIRED} in query!`,
			};
			return Response.error(obj);
		}

		const userPropertyType = req.decoded.PropertyType;
		let qry = {};

		if (userPropertyType === "both" ) {
			if (selectedType === "commercial") {
				qry.buildingType = "commercial";
			} else if (selectedType === "residential") {
				qry.buildingType = "residential";
			}
		} else {
			qry.buildingType = userPropertyType;
		}
		
		qry = {
			...qry,
			archive: false,
		};
		// Subtract 5 years from the current date
		const fiveYearsAgo = new Date();
		fiveYearsAgo
			.setFullYear(fiveYearsAgo.getFullYear() - 5, 0, 1)
			.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
		fiveYearsAgo.setUTCHours(0, 0, 0, 0); // 00:00:00.000 UTC

		const toDate = new Date();
		toDate
			.setFullYear(toDate.getFullYear() - 0, 11, 31)
			.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
		toDate.setUTCHours(23, 59, 59, 999); // 23:59:59.999 UTC

		const currentYear = new Date().getFullYear();
		const range = (start, stop, step) =>
			Array.from(
				{ length: (stop - start) / step + 1 },
				(_, i) => start + i * step
			);
		const lastFiveYears = range(currentYear, currentYear - 5, -1);
		// lastFiveYears.shift();

		const topToDate = new Date(to);
    topToDate
      .setDate(topToDate.getDate() + 1)
      .toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

		const topFromDate = new Date(from);
		topFromDate
		.setDate(topFromDate.getDate() + 1)
		.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

		if (!locality) {
			locality = await registry.aggregate([
				{
					$match: {
						city: ObjectId(cityId),
						...qry,
						$expr: {
							$and: [
								{ $gte: ["$RegistrationDate", topFromDate] },
								{ $lte: ["$RegistrationDate", topToDate] },
							],
						},
					},
				},
				{
					$group: {
						_id: "$locality",
						sqf: { $sum: "$SquareFeet" },
					},
				},
				{
					$sort: {
						sqf: -1,
					},
				},
				{
					$limit: 3,
				},
			]);
			locality = locality.map((item) => item._id);
		} else {
			if (!Array.isArray(locality)) locality = [locality];
		}

		const data = await registry.aggregate([
			{
				$match: {
					city: ObjectId(cityId),
					locality: { $in: locality },
					// DocumentName: documentType,
					DocumentType :documentType,
					...qry,
					$expr: {
						$and: [
							{ $gte: ["$RegistrationDate", fiveYearsAgo] },
							{ $lte: ["$RegistrationDate", toDate] },
						],
					},
				},
			},
			{
				$addFields: {
					year: { $year: "$RegistrationDate" },
				},
			},
			{
				$group: {
					_id: {
						locality: "$locality",
						year: "$year",
					},
					totalAmount: { $avg: "$sale_rate" },
				},
			},
			{
				$group: {
					_id: "$_id.locality",
					yearsData: {
						$push: {
							year: "$_id.year",
							totalAmount: "$totalAmount",
						},
					},
				},
			},
			{
				$project: {
					_id: 0,
					name: "$_id",
					data: {
						$map: {
							input: lastFiveYears,
							as: "year",
							in: {
								$cond: [
									{ $in: ["$$year", "$yearsData.year"] },
									{
										$arrayElemAt: [
											"$yearsData.totalAmount",
											{ $indexOfArray: ["$yearsData.year", "$$year"] },
										],
									},
									0,
								],
							},
						},
					},
					// year: lastFiveYears,
				},
			},
		]);

		const obj = {
			res,
			msg: Constant.INFO_MSGS.SUCCESS,
			status: Constant.STATUS_CODE.OK,
			data: {
				data,
				years: lastFiveYears,
			},
		};
		return Response.success(obj);
	} catch (error) {
		console.log(error);
		return handleException(logger, res, error);
	}
};

module.exports = {
	findTrendingLocalities,
	findLocalitiesByPrice,
};
