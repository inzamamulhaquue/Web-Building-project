const { handleException } = require("../../helpers/exception");
const Response = require("../../helpers/response");
const Constant = require("../../helpers/constant");
const { addOnUpdate } = require("../notification/notification");
const agreementModel = require("../../models/agreement");
const pdfModel = require("../../models/pdfUpload");
const admins = require("../../models/admin");
const registry = require("../../models/registry");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const axios = require("axios");
const { debit } = require("../building/view");

const addAgreement = async (req, res) => {
	const { logger } = req;
	try {
		const saveAgreement = await agreementModel.create(req.body);
		if (!saveAgreement) {
			const obj = {
				res,
				status: Constant.STATUS_CODE.BAD_REQUEST,
				msg: Constant.ERROR_MSGS.CREATE_ERR,
			};
			return Response.error(obj);
		} else {
			const idArr = [];
			const inAdded = await admins.find();
			inAdded.map((e) => {
				idArr.push(e._id);
			});

			const notificationObj = {
				title: "New Agreement Request!",
				message: `New request added by ${req.body.fullName}`,
				registryId: req.body.registryId,
				adminId: idArr,
			};
			addOnUpdate(notificationObj);
			const obj = {
				res,
				msg: Constant.INFO_MSGS.CREATED_SUCCESSFULLY,
				status: Constant.STATUS_CODE.OK,
				data: saveAgreement,
			};
			return Response.success(obj);
		}
	} catch (error) {
		console.log("error", error);
		return handleException(logger, res, error);
	}
};

const downloadpdf = async (req, res) => {
	const { logger } = req;
	try {
		const { registryId } = req.params;
		const pdfDocument = await pdfModel.findOne({ registryId });
		if (!pdfDocument) {
			const obj = {
				res,
				status: Constant.STATUS_CODE.RESOURCE_NOT_FOUND,
				msg: Constant.INFO_MSGS.NO_DATA,
			};
			return Response.error(obj);
		} else {
			const obj = {
				res,
				msg: Constant.INFO_MSGS.SUCCESS,
				status: Constant.STATUS_CODE.OK,
				data: pdfDocument,
			};

			return Response.success(obj);
			// const response = await axios.get(pdfDocument.url, {
			// 	responseType: "stream",
			// });

			// if (response.status !== 200) {
			// 	const obj = {
			// 		res,
			// 		status: Constant.STATUS_CODE.RESOURCE_NOT_FOUND,
			// 		msg: Constant.INFO_MSGS.NO_DATA,
			// 	};
			// 	return Response.error(obj);
			// }

			// res.setHeader("Content-Type", "application/pdf");
			// res.setHeader(
			// 	"Content-Disposition",
			// 	`attachment; filename="${registryId}.pdf"`
			// );

			// response.data.pipe(res);
		}
	} catch (error) {
		console.log("error", error);
		return handleException(logger, res, error);
	}
};

const debitAmount = async (req, res) => {
	const { logger } = req;

	try {
		const { BuildingName, DocumentNo, userId } = req.body;
		const amount = 1;

		const remark = `Agreement for ${BuildingName}, Document Number - ${DocumentNo}`;

		await debit(logger, amount, remark, userId);

		return Response.success({
			res,
			msg: Constant.INFO_MSGS.SUCCESS,
			status: Constant.STATUS_CODE.OK,
		});
	} catch (error) {
		console.log("error", error);
		return handleException(logger, res, error);
	}
};

module.exports = {
	addAgreement,
	downloadpdf,
	debitAmount,
};
