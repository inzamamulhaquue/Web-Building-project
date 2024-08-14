const index2 = require("../../models/index2");
const Response = require("../../helpers/response");
const Constant = require("../../helpers/constant");

const getIndex2ById = async (req, res) => {
	const { logger } = req;
	try {
		const { registryId } = req.params;
		const index2Data = await index2.findOne({ registryId });
        console.log(index2Data)
		if (!index2Data) {
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
				data: index2Data,
			};

			return Response.success(obj);
		}
	} catch (error) {
		console.log("error", error);
		return handleException(logger, res, error);
	}
};



module.exports = {
	getIndex2ById
};