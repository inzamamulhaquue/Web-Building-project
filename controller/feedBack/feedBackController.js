const { handleException } = require("../../helpers/exception");
const Response = require("../../helpers/response");
const Constant = require("../../helpers/constant");
const feedBackModel = require("../../models/feedBack");

const addFeedBack = async (req, res) => {
  const { logger } = req;

  try {
    var dataToInsert = [];
    const {
          firstName,
          lastName,
          email,
          mobile,
          feedBack,
        } = req.body;
    if (req.files && req.files.length) {
      // for (let file of req.files) {
      for (let i = 0; i < req.files.length; i++) {
        dataToInsert.push(
          req.files[i].location
        );
      }
    }

      const saveFeedBack = await feedBackModel.create({
        firstName,
        lastName,
        email,
        mobile,
        feedBack,
        images:dataToInsert
      });

      if (!saveFeedBack) {
        const obj = {
          res,
          status: Constant.STATUS_CODE.BAD_REQUEST,
          msg: Constant.ERROR_MSGS.CREATE_ERR,
        };
        return Response.error(obj);
      } else {
        const obj = {
          res,
          files: req.files,
          msg: Constant.INFO_MSGS.CREATED_SUCCESSFULLY,
          status: Constant.STATUS_CODE.OK,
          data: saveFeedBack,
        };
        return Response.success(obj);
      }

  } catch (error) {
    console.log("error", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  addFeedBack,
};
