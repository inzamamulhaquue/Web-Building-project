const microMarketModel = require("../models/newMicroMarket");
const { default: mongoose } = require("mongoose");
const { handleException } = require("../helpers/exception");
const Response = require("../helpers/response");
const Constant = require('../helpers/constant');

const Landing_api = async (req, res) => {
const { logger } = req;
try {
  let  {city} =req.query;
  const getAllmicromaket = await microMarketModel.find({
    city: mongoose.Types.ObjectId(city),
  });
  if (!getAllmicromaket) {
    const obj = {
      res,
      status: Constant.STATUS_CODE.BAD_REQUEST,
      msg: Constant.ERROR_MSGS.INVALID_LOGIN,
    };
    return Response.error(obj);
  } else {
    const obj = {
      res,
      msg: Constant.INFO_MSGS.CREATED_SUCCESSFULLY,
      status: Constant.STATUS_CODE.OK,
      data:getAllmicromaket
    };
    return Response.success(obj);
  }
} catch (error) {
  console.log("error", error);
  return handleException(logger, res, error);
}
};
module.exports = {
    Landing_api,
  };
  