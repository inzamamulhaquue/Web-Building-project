const { handleException } = require("../../helpers/exception");
const registry = require("../../models/registry");
const Response = require("../../helpers/response");
const Constant = require("../../helpers/constant");
const { ObjectId } = require("mongoose").Types;
const momenttz = require("moment-timezone");
momenttz.tz("Asia/Kolkata");

const findTopTenAbsorption = async (req, res) => {
  const { logger } = req;

  try {
    const { cityId, to, from ,selectedType} = req.query;
        if (!cityId || !to || !from) {
      const obj = {
        res,
        status: Constant.STATUS_CODE.BAD_REQUEST,
        msg: `"cityId", "to" date and from "date" ${Constant.INFO_MSGS.MSG_REQUIRED} in query!`,
      };
      return Response.error(obj);
    }
    const userPropertyType = req.decoded.PropertyType;
    let qry = {};
    if (userPropertyType === "commercial") {
			qry.buildingType = "commercial";
		  } else if (userPropertyType === "residential") {
			qry.buildingType = "residential";
		  } else if (userPropertyType === "both") {
			if (selectedType === "commercial") {
			  qry.buildingType = "commercial";
			} else if (selectedType === "residential") {
			  qry.buildingType = "residential";
			}
		  }
		  qry = {
			...qry,
			archive: false,
		  };
    // if (
    //   userPropertyType === "commercial" ||
    //   userPropertyType === "residential"
    // ) {
    //   qry.buildingType = userPropertyType;
    // } else if (userPropertyType === "both") {
    //   qry.buildingType = { $in: ["commercial", "residential"] };
    // }
    // console.log("qry", qry)
    
    const toDate = new Date(to);
    toDate
      .setDate(toDate.getDate() + 1)
      .toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    
    const fromDate = new Date(from);
    fromDate
      .setDate(fromDate.getDate() + 1)
      .toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

    const data = await registry.aggregate([
      {
        $match: {
          city: ObjectId(cityId),
          ...qry,
          $expr: {
            $and: [
              { $gte: ["$RegistrationDate", fromDate] },
              { $lte: ["$RegistrationDate", toDate] },
            ],
          },
        }
      },
      {
        $group: {
          _id: "$locality",
          name: {
            $first: "$locality",
          },
          sqf: { $sum: "$SquareFeet" },
        },
      },
      {
        $sort: {
          sqf: -1, // Sort in descending order based on sqf field
        },
      },
      {
        $limit: 10,
      }
    ]);
    
    const obj = {
      res,
      msg: Constant.INFO_MSGS.SUCCESS,
      status: Constant.STATUS_CODE.OK,
      data: data,
    };
    return Response.success(obj);
  } catch (error) {
    console.log(error);
    return handleException(logger, res, error);
  }
};

const findTopTenSupply = async (req, res) => {
  const { logger } = req;

  try {
    const { cityId, to, from } = req.query;

    if (!cityId || !to || !from) {
      const obj = {
        res,
        status: Constant.STATUS_CODE.BAD_REQUEST,
        msg: `"cityId", "to" date and from "date" ${Constant.INFO_MSGS.MSG_REQUIRED} in query!`,
      };
      return Response.error(obj);
    }

    const toDate = new Date(to);
    toDate
      .setDate(toDate.getDate() + 1)
      .toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

    const data = await registry.aggregate([
      {
        $match: {
          city: ObjectId(cityId),
          $expr: {
            $and: [
              {
                $gte: [
                  "$RegistrationDate",
                  new Date(from).toLocaleString("en-US", {
                    timeZone: "Asia/Kolkata",
                  }),
                ],
              },
              { $lte: ["$RegistrationDate", toDate] },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$locality",
          sqf: { $sum: "$SquareFeet" },
          name: {
            $first: "$locality",
          },
          buildings: { $addToSet: "$buildingId" },
        },
      },
      {
        $lookup: {
          from: "buildings",
          localField: "buildings",
          foreignField: "_id",
          as: "buildingDetails",
        },
      },
      {
        $unwind: "$buildingDetails",
      },
      {
        $group: {
          _id: "$_id",
          sqf: { $first: "$sqf" },
          name: {
            $first: "$name",
          },
          totalSquareFeet: { $sum: "$buildingDetails.totalSquareFeet" },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          sqf: { $subtract: ["$totalSquareFeet", "$sqf"] },
        },
      },
      {
        $sort: {
          sqf: -1, // Sort in descending order based on sqf field
        },
      },
      {
        $limit: 10,
      },
    ]);

    const obj = {
      res,
      msg: Constant.INFO_MSGS.SUCCESS,
      status: Constant.STATUS_CODE.OK,
      data: data,
    };
    return Response.success(obj);
  } catch (error) {
    console.log(error);
    return handleException(logger, res, error);
  }
};

const findTopTenDemand = async (req, res) => {
  const { logger } = req;

  try {
    const { cityId, to, from } = req.query;

    if (!cityId || !to || !from) {
      const obj = {
        res,
        status: Constant.STATUS_CODE.BAD_REQUEST,
        msg: `"cityId", "to" date and from "date" ${Constant.INFO_MSGS.MSG_REQUIRED} in query!`,
      };
      return Response.error(obj);
    }

    const toDate = new Date(to);
    toDate
      .setDate(toDate.getDate() + 1)
      .toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

    const data = await registry.aggregate([
      {
        $match: {
          city: ObjectId(cityId),
          $expr: {
            $and: [
              {
                $gte: [
                  "$RegistrationDate",
                  new Date(from).toLocaleString("en-US", {
                    timeZone: "Asia/Kolkata",
                  }),
                ],
              },
              { $lte: ["$RegistrationDate", toDate] },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$locality",
          sqf: { $sum: "$SquareFeet" },
          name: {
            $first: "$locality",
          },
        },
      },
      {
        $sort: {
          sqf: -1, // Sort in descending order based on sqf field
        },
      },
      {
        $limit: 10,
      },
    ]);

    const obj = {
      res,
      msg: Constant.INFO_MSGS.SUCCESS,
      status: Constant.STATUS_CODE.OK,
      data: data,
    };
    return Response.success(obj);
  } catch (error) {
    console.log(error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  findTopTenAbsorption,
  findTopTenSupply,
  findTopTenDemand,
};
