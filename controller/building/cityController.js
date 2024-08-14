const { handleException } = require("../../helpers/exception");
const Response = require("../../helpers/response");
const Constant = require("../../helpers/constant");
const city = require("../../models/city");
const { default: mongoose } = require("mongoose");
const _ = require("underscore");

const getAllcity = async (req, res) => {
  const { logger } = req;
  try {
    // let getstateData = await state.find();
    // for (let stateA of getstateData) {
    //     await city.updateMany(
    //         { state: stateA.stateTitle },
    //         {
    //             stateId: stateA._id
    //         })
    //     console.log(' state: stateA.stateTitle ', stateA.stateTitle )
    // }

    let getCityData = await city.find();

    if (getCityData.length > 0) {
      const obj = {
        res,
        msg: Constant.INFO_MSGS.SUCCESS,
        status: Constant.STATUS_CODE.OK,
        data: getCityData,
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

const getCityByStateId = async (req, res) => {
  const { logger } = req;
  try {
    let { sortBy, str, page, limit, state } = req.query;
    if (_.isUndefined(str)) str = "";
    if (sortBy === "recent") {
      sortBy = { createdAt: -1 };
    } else {
      sortBy = { createdAt: 1 };
    }

    let qry = {};
    if (str) {
      qry["$or"] = [
        { city: { $regex: str, $options: "i" } },
        { admin_name: { $regex: str, $options: "i" } },
      ];
    }
    if (state) {
      qry["$or"] = [{ stateId: mongoose.Types.ObjectId(state) }];
    }
    offset = page || 1;
    limit = limit || 20;
    const skip = limit * (offset - 1);
    const cityData = await city.aggregate([
      {
        $match: qry,
      },
      { $sort: sortBy },
      {
        $facet: {
          paginatedResult: [{ $skip: skip }, { $limit: parseInt(limit) }],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);
    if (_.isEmpty(cityData[0].paginatedResult)) {
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
        data: cityData[0].paginatedResult,
        pagination: {
          offset: parseInt(offset),
          limit: parseInt(limit),
          total: cityData[0].totalCount[0].count,
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
  getAllcity,
  getCityByStateId,
};
