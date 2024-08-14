const { handleException } = require("../../helpers/exception");
const Response = require("../../helpers/response");
const Constant = require("../../helpers/constant");
const careerModel = require("../../models/career");

const addCareer = async (req, res) => {
  const { logger } = req;

  try {
    var dataToInsert = [];
    const {
          firstName,
          lastName,
          email,
          mobile,
          location,
          description,
        } = req.body;
    if (req.files && req.files.length) {
      // for (let file of req.files) {
      for (let i = 0; i < req.files.length; i++) {
        dataToInsert.push(
          req.files[i].location
        );
      }
    }
      const saveCareer = await careerModel.create({
        firstName,
        lastName,
        email,
        mobile,
        location,
        description,
        resume_cv:dataToInsert
      });

      if (!saveCareer) {
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
          data: saveCareer,
        };
        return Response.success(obj);
      }

  } catch (error) {
    console.log("error", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  addCareer,
};
