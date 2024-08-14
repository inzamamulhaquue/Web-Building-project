const { handleException } = require("../../helpers/exception");
const Response = require("../../helpers/response");
const Constant = require("../../helpers/constant");
const state = require("../../models/state");


const getAllState = async (req, res) => {
  const { logger } = req;
  try {
    let str = req.query.str;
    let qry = {};
    if (str) {
      qry["$or"] = [{ stateTitle: { $regex: str, $options: "i" } }];
    }
    let getData = await state.aggregate([
      { $match: qry },
      {
        $facet: {
          total_count: [
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
          result: [
            {
              $project: {
                __v: 0,
              },
            },
          ],
        },
      },
    ]);
    getData = getData[0];
    if (getData.result.length > 0) {
      const obj = {
        res,
        msg: Constant.INFO_MSGS.SUCCESS,
        status: Constant.STATUS_CODE.OK,
        data: getData.result,
      };
      return Response.success(obj);
    } else {
      const obj = {
        res,
        status: Constant.STATUS_CODE.BAD_REQUEST,
        msg: Constant.INFO_MSGS.NO_DATA,
      };
      return Response.error(obj);
    }
  } catch (error) {
    console.log("error", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  getAllState,
};