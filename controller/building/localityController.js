const { handleException } = require("../../helpers/exception");
const Response = require("../../helpers/response");
const Constant = require("../../helpers/constant");
const city = require("../../models/city");
const { default: mongoose } = require("mongoose");
const newMicroMarketModel = require("../../models/newMicroMarket");
const _ = require("underscore");

const getlocalityByCityId = async (req, res) => {
  const { logger } = req;
  try {
    let city = req.params.cityid;
    let { sortBy, str, page, limit } = req.query;
    if (_.isUndefined(str)) str = "";
    if (sortBy === "recent") {
      sortBy = { createdAt: -1 };
    } else {
      sortBy = { createdAt: 1 };
    }

    let qry = {};
    if (str) {
      qry["$or"] = [{ locality: { $regex: str, $options: "i" } }];
    }
    if (city) {
      qry["$or"] = [{ city: mongoose.Types.ObjectId(city) }];
    }
    let offset = page || 1;
    let localLimit = limit ? parseInt(limit) : 0;
    let skip = 0;
    if (offset > 1 && localLimit > 0) {
      skip = localLimit * (offset - 1);
    }
    let aggregationStages = [{ $match: qry }, { $sort: sortBy }];
    if (localLimit > 0) {
      aggregationStages.push({
        $facet: {
          paginatedResult: [{ $skip: skip }, { $limit: localLimit }],
          totalCount: [{ $count: "count" }],
        },
      });
    } else {
      aggregationStages.push({
        $facet: {
          paginatedResult: [{ $skip: skip }],
          totalCount: [{ $count: "count" }],
        },
      });
    }
    const localityData = await newMicroMarketModel.aggregate(aggregationStages);
    if (_.isEmpty(localityData[0].paginatedResult)) {
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
        data: localityData[0].paginatedResult,
        pagination: {
          offset: parseInt(offset),
          limit: parseInt(limit),
          total: localityData[0].totalCount[0].count,
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
  getlocalityByCityId,
};
