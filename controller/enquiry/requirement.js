const { handleException } = require("../../helpers/exception");
const Response = require("../../helpers/response");
const Constant = require("../../helpers/constant");
const { addOnUpdate } = require("../notification/notification");
const requirementModel = require("../../models/requirement");
const admins = require("../../models/admin");

const addRequirement = async (req, res) => {
	const { logger } = req;
	try {
		const saveRequirement = await requirementModel.create(req.body);
		if (!saveRequirement) {
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
				title: "New Data Request!",
				message: `New Requirement added by ${req.body.fullName}`,
				adminId: idArr,
			};
			addOnUpdate(notificationObj);
			const obj = {
				res,
				msg: Constant.INFO_MSGS.CREATED_SUCCESSFULLY,
				status: Constant.STATUS_CODE.OK,
				data: saveRequirement,
			};
			return Response.success(obj);
		}
	} catch (error) {
		console.log("error", error);
		return handleException(logger, res, error);
	}
};

module.exports = {
	addRequirement,
};
