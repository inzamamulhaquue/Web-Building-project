const enquiryModel = require("../../models/enquiry");
const { handleException } = require("../../helpers/exception");
const Response = require("../../helpers/response");
const Constant = require("../../helpers/constant");
const { ObjectId } = require('mongoose').Types;
const moment = require("moment");

const addNewEnquiry = async (req, res) => {
      const { logger } = req;

      try {

            
            const { name, email, phone, message, userId, } = req.body;
            
            if (!name || !email || !phone || !message || !userId) {
                  const obj = {
                        res,
                        status: Constant.STATUS_CODE.BAD_REQUEST,
                        msg: `name, email, phone, message and userId ${Constant.INFO_MSGS.MSG_REQUIRED} in body!`,
                  };
                  return Response.error(obj);
            }
            
            const openedEnquiry = await enquiryModel.findOne({userId: ObjectId(userId), status: 'OPEN'});
            if(openedEnquiry) {
                  const obj = {
                        res,
                        status: Constant.STATUS_CODE.BAD_REQUEST,
                        msg: `You have already a open Enquiry. Let the admin close that first. Thank you for the patience.`,
                        data: openedEnquiry
                  };
                  return Response.error(obj);      
            }
            const createEnquiry = await enquiryModel.create({ name, email, phone, message, userId: ObjectId(userId), openedOn: moment().utcOffset("+05:30").format('YYYY-MM-DD HH:mm:ss') });
            const obj = {
                  res,
                  msg: Constant.INFO_MSGS.CREATED_SUCCESSFULLY,
                  status: Constant.STATUS_CODE.OK,
                  data: createEnquiry,
            };
            return Response.success(obj);

      } catch (error) {
            console.log("error", error);
            return handleException(logger, res, error);
      }
}


module.exports = {
      addNewEnquiry
}