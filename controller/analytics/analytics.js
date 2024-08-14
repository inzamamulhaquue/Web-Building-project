const { handleException } = require("../../helpers/exception");
const Response = require("../../helpers/response");
const Constant = require("../../helpers/constant");
const building = require("../../models/building");
const registry = require("../../models/registry");
const newMicroMarketModel = require("../../models/newMicroMarket");
const _ = require("underscore");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const getSquareFeet = async (req, res) => {
  const { logger } = req;

  try {
    const _id = req.params.id;
    const userPropertyType = req.decoded.PropertyType;
    const { userId } = req.decoded;
    let qry = {};
    if (
      userPropertyType === "commercial" ||
      userPropertyType === "residential"
    ) {
      qry.buildingType = userPropertyType;
    } else if (userPropertyType === "both") {
      qry.buildingType = { $in: ["commercial", "residential"] };
    }
    qry = {
      ...qry,
      archive: false,
    };

    const squareFeetSum = await registry.aggregate([
      {
        $match: {
          buildingId: ObjectId(_id),
          ...qry,
        },
      },
      {
        $group: {
          _id: "$FlatNo",
          totalSquareFeet: { $sum: "$SquareFeet" },
        },
      },
    ]);

    const registryData = await registry.find({
      buildingId: ObjectId(_id),
      SquareFeet: { $gte: parseInt(0), $lte: parseInt(1000) },
      ...qry,
    });

    const registryData5000 = await registry.find({
      buildingId: ObjectId(_id),
      SquareFeet: { $gte: parseInt(1001), $lte: parseInt(2000) },
      ...qry,
    });

    const registryData10000 = await registry.find({
      buildingId: ObjectId(_id),
      SquareFeet: { $gte: parseInt(2001), $lte: parseInt(3000) },
      ...qry,
    });

    const registryData50000 = await registry.find({
      buildingId: ObjectId(_id),
      SquareFeet: { $gte: parseInt(3001), $lte: parseInt(500000) },
      ...qry,
    });

    const registryData100000 = await registry.find({
      buildingId: ObjectId(_id),
      SquareFeet: {
        $gte: parseInt(4001),
        $lte: parseInt(100000000000),
      },
      ...qry,
    });

    if (
      !registryData &&
      !registryData5000 &&
      !registryData10000 &&
      !registryData50000 &&
      !registryData100000
    ) {
      const obj = {
        res,
        status: Constant.STATUS_CODE.BAD_REQUEST,
        msg: Constant.INFO_MSGS.NO_DATA,
      };
      return Response.error(obj);
    } else {
      const obj = {
        res,
        msg: Constant.INFO_MSGS.SUCCESS,
        status: Constant.STATUS_CODE.OK,
        data: {
          squareFeetSum: squareFeetSum[0].totalSquareFeet,
          data: [
            {
              x: "< 1000",
              y: registryData.length,
            },
            {
              x: "1001 - 2000",
              y: registryData5000.length,
            },
            {
              x: "2001 - 3000",
              y: registryData10000.length,
            },
            {
              x: "3001 - 4000",
              y: registryData50000.length,
            },
            {
              x: "> 4000",
              y: registryData100000.length,
            },
          ],
        },
      };
      return Response.success(obj);
    }
  } catch (error) {
    console.log("error", error);
    return handleException(logger, res, error);
  }
};

//GRAPH - 1

// const getTop10Locality = async (req, res) => {
//   const { logger } = req;
//   try {
//     //cityId
//     //LocalityId
//     const qry = {};
//     let { sortBy, str, page, limit, cityId, locality } = req.query;

//     if (!cityId && !locality) {
//         const obj = {
//           res,
//           status: Constant.STATUS_CODE.BAD_REQUEST,
//           msg: `CityId & Locality-Title ${Constant.INFO_MSGS.MSG_REQUIRED} in query params `,
//         };
//         return Response.error(obj);
//       }

//     if (cityId && locality) {
//       qry["$and"] = [
//         { city: ObjectId(cityId) },
//         { locality: { $regex: locality, $options: "i" } },
//       ];
//     }

//     // limit = 50;
//     const registryData = await registry.aggregate([
//       { $match: qry },
//     //   { $group: { _id: null, total: { $sum: "$totalSquareFeet" } } },
//       { $group: { _id: null, total: { $sum: "$SquareFeet" } } },
//       //   { $sort: { createdAt: -1 } },
//       //   {
//       //     $facet: {
//       //       paginatedResult: [{ $limit: parseInt(limit) }],
//       //       totalCount: [{ $count: "count" }],
//       //     },
//       //   },
//     ]);

//     console.log("registryData--->",registryData)
//     // if (_.isEmpty(registryData[0].paginatedResult)) {
//     //   obj = {
//     //     res,
//     //     status: Constant.STATUS_CODE.OK,
//     //     msg: Constant.INFO_MSGS.ITEMS_NOT_AVAILABLE,
//     //     data: {
//     //       transaction: [],
//     //       pagination: {
//     //         limit: parseInt(limit),
//     //         total: 0,
//     //       },
//     //     },
//     //   };
//     //   return Response.success(obj);
//     // }
//     // obj = {
//     //   res,
//     //   msg: Constant.INFO_MSGS.SUCCESS,
//     //   status: Constant.STATUS_CODE.OK,
//     //   data: {
//     //     transaction: registryData[0].paginatedResult,
//     //     pagination: {
//     //       limit: parseInt(limit),
//     //       total: registryData[0].totalCount[0].count,
//     //     },
//     //   },
//     // };

//     // return Response.success(obj);
//   } catch (error) {
//     console.log("error", error);
//     return handleException(logger, res, error);
//   }
// };

//GRAPH - 2

const getCurrunt50registry = async (req, res) => {
  const { logger } = req;
  try {
    limit = 50;
    const cityId = req.query.cityId;
    const userPropertyType = req.decoded.PropertyType;
    const selectedType = req.query.selectedType;
    let qry = {};
    qry.city = ObjectId(cityId);
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
    const registryData = await registry.aggregate([
      {
        $match: { ...qry, archive: false },
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          paginatedResult: [{ $limit: parseInt(limit) }],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);
    if (_.isEmpty(registryData[0].paginatedResult)) {
      obj = {
        res,
        status: Constant.STATUS_CODE.OK,
        msg: Constant.INFO_MSGS.ITEMS_NOT_AVAILABLE,
        data: {
          transaction: [],
          pagination: {
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
        transaction: registryData[0].paginatedResult,
        pagination: {
          limit: parseInt(limit),
          total: registryData[0].totalCount[0].count,
        },
      },
    };

    return Response.success(obj);
  } catch (error) {
    console.log("error", error);
    return handleException(logger, res, error);
  }
};

const getTotalStock = async (req, res) => {
  const { logger } = req;
  try {
    let cityId = req.params.id;
    const userPropertyType = req.decoded.PropertyType;
    const selectedType = req.query.selectedType;
    let qry = {};
    if (
      userPropertyType === "commercial" ||
      userPropertyType === "residential"
    ) {
      qry.buildingType = userPropertyType;
    } else if (userPropertyType === "both" && selectedType) {
      qry.buildingType = `${selectedType}`;
    }
    const totalMicromartk = await newMicroMarketModel.aggregate([
      {
        $match: {
          city: ObjectId(cityId),
        },
      },
      {
        $group: {
          _id: "$microMarketTitle",
          microId: {
            $addToSet: "$_id",
          },
        },
      },
      {
        $project: {
          microMarketTitle: "$_id",
          microId: "$microId",
        },
      },
      {
        $lookup: {
          from: "buildings",
          localField: "microId",
          foreignField: "microMarket",
          as: "buildingsData",
        },
      },
      {
        $unwind: {
          path: "$buildingsData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "buildingsData.buildingType": qry.buildingType,
        },
      },
      {
        $group: {
          _id: "$_id",
          SquareFeet: { $sum: "$buildingsData.totalSquareFeet" },
        },
      },
    ]);

    obj = {
      res,
      msg: Constant.INFO_MSGS.SUCCESS,
      status: Constant.STATUS_CODE.OK,
      data: totalMicromartk,
    };

    return Response.success(obj);
  } catch (error) {
    console.log("error", error);
    return handleException(logger, res, error);
  }
};

const findDemand = async (req, res) => {
  const { logger } = req;

  try {
    const { cityId, to, from } = req.query;
    const userPropertyType = req.decoded.PropertyType;
    let qry = {};
    if (
      userPropertyType === "commercial" ||
      userPropertyType === "residential"
    ) {
      qry.buildingType = userPropertyType;
    } else if (userPropertyType === "both") {
      qry.buildingType = { $in: ["commercial", "residential"] };
    }
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
          ...qry,
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
          _id: "$microMarket",
          sqf: { $sum: "$SquareFeet" },
          microMarketId: {
            $first: "$microMarket",
          },
        },
      },
      {
        $lookup: {
          from: "newmicromarkets",
          localField: "microMarketId",
          foreignField: "_id",
          as: "microMarketData",
        },
      },
      {
        $unwind: "$microMarketData",
      },
      {
        $group: {
          _id: "$microMarketData.microMarketTitle",
          sqf: { $sum: "$sqf" },
        },
      },
      {
        $project: {
          name: "$_id",
          sqf: 1,
          _id: 0,
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

const findTopSupplyByYears = async (req, res) => {
  const { logger } = req;

  try {
    let { cityId } = req.query;
    if (!cityId) {
      const obj = {
        res,
        status: Constant.STATUS_CODE.BAD_REQUEST,
        msg: `"cityId" ${Constant.INFO_MSGS.MSG_REQUIRED} in query!`,
      };
      return Response.error(obj);
    }

    // Subtract 5 years from the current date
    const fiveYearsAgo = new Date();
    fiveYearsAgo
      .setFullYear(fiveYearsAgo.getFullYear() - 5, 0, 1)
      .toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    fiveYearsAgo.setUTCHours(0, 0, 0, 0); // 00:00:00.000 UTC

    const toDate = new Date();
    toDate
      .setFullYear(toDate.getFullYear() - 0, 11, 31)
      .toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    toDate.setUTCHours(23, 59, 59, 999); // 23:59:59.999 UTC

    // toDate;

    const currentYear = new Date().getFullYear();
    const range = (start, stop, step) =>
      Array.from(
        { length: (stop - start) / step + 1 },
        (_, i) => start + i * step
      );
    const lastFiveYears = range(currentYear, currentYear - 5, -1);
    // lastFiveYears.shift();

    // console.log(lastFiveYears)

    const data = await registry.aggregate([
      {
        $match: {
          city: ObjectId(cityId),
          // locality: { $in: locality },
          // DocumentName: documentType,

          $expr: {
            $and: [
              { $gte: ["$RegistrationDate", fiveYearsAgo] },
              { $lte: ["$RegistrationDate", toDate] },
            ],
          },
        },
      },
      {
        $addFields: {
          year: { $year: "$RegistrationDate" },
        },
      },
      {
        $group: {
          _id: {
            // microMarket: "$microMarket",
            // DocumentName: "$DocumentName",
            year: "$year",
          },
          totalSquareFeet: { $sum: "$SquareFeet" },
        },
      },
      {
        $group: {
          _id: "$_id.year",
          yearsData: {
            $push: {
              year: "$_id.year",
              totalSquareFeet: "$totalSquareFeet",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          data: {
            $map: {
              input: lastFiveYears,
              as: "year",
              in: {
                $cond: [
                  { $in: ["$$year", "$yearsData.year"] },
                  {
                    $arrayElemAt: [
                      "$yearsData.totalSquareFeet",
                      {
                        $indexOfArray: ["$yearsData.year", "$$year"],
                      },
                    ],
                  },
                  0,
                ],
              },
            },
          },
        },
      },
      {
        $sort: {
          name: 1,
        },
      },
    ]);

    const obj = {
      res,
      msg: Constant.INFO_MSGS.SUCCESS,
      status: Constant.STATUS_CODE.OK,
      data: {
        data,
        years: lastFiveYears,
      },
    };

    return Response.success(obj);
  } catch (error) {
    console.log(error);
    return handleException(logger, res, error);
  }
};

const findTopSupply = async (req, res) => {
  const { logger } = req;

  try {
    const { cityId, to, from } = req.query;
    const userPropertyType = req.decoded.PropertyType;
    let qry = {};
    if (
      userPropertyType === "commercial" ||
      userPropertyType === "residential"
    ) {
      qry.buildingType = userPropertyType;
    } else if (userPropertyType === "both") {
      qry.buildingType = { $in: ["commercial", "residential"] };
    }
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
          ...qry,
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
          _id: "$microMarket",
          sqf: { $sum: "$SquareFeet" },
          microMarketId: {
            $first: "$microMarket",
          },
          buildings: { $addToSet: "$buildingId" },
        },
      },
      {
        $lookup: {
          from: "newmicromarkets",
          localField: "microMarketId",
          foreignField: "_id",
          as: "microMarketData",
        },
      },
      {
        $unwind: "$microMarketData",
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
            $first: "$microMarketData.microMarketTitle",
          },
          totalSquareFeet: {
            $sum: "$buildingDetails.totalSquareFeet",
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          sqf: "$sqf",
          // sqf: { $subtract: ["$totalSquareFeet", "$sqf"] },
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

    const groupedData = data.reduce((acc, curr) => {
      const index = acc.findIndex((item) => item.name === curr.name);
      if (index === -1) {
        acc.push({ name: curr.name, sqf: curr.sqf });
      } else {
        acc[index].sqf += curr.sqf;
      }
      return acc;
    }, []);

    const obj = {
      res,
      msg: Constant.INFO_MSGS.SUCCESS,
      status: Constant.STATUS_CODE.OK,
      data: groupedData,
    };
    return Response.success(obj);
  } catch (error) {
    console.log(error);
    return handleException(logger, res, error);
  }
};

const findYield = async (req, res) => {
  const { logger } = req;

  try {
    let { cityId } = req.query;

    if (!cityId) {
      const obj = {
        res,
        status: Constant.STATUS_CODE.BAD_REQUEST,
        msg: `"cityId" ${Constant.INFO_MSGS.MSG_REQUIRED} in query!`,
      };
      return Response.error(obj);
    }

    // Subtract 5 years from the current date
    const fiveYearsAgo = new Date();
    fiveYearsAgo
      .setFullYear(fiveYearsAgo.getFullYear() - 5, 0, 1)
      .toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    fiveYearsAgo.setUTCHours(0, 0, 0, 0); // 00:00:00.000 UTC

    const toDate = new Date();
    toDate
      .setFullYear(toDate.getFullYear() - 0, 11, 31)
      .toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    toDate.setUTCHours(23, 59, 59, 999); // 23:59:59.999 UTC

    // toDate;

    const currentYear = new Date().getFullYear();
    const range = (start, stop, step) =>
      Array.from(
        { length: (stop - start) / step + 1 },
        (_, i) => start + i * step
      );
    const lastFiveYears = range(currentYear, currentYear - 5, -1);
    // lastFiveYears.shift();

    const data = await registry.aggregate([
      {
        $match: {
          city: ObjectId(cityId),
          // locality: { $in: locality },
          // DocumentName: documentType,
          $expr: {
            $and: [
              { $gte: ["$RegistrationDate", fiveYearsAgo] },
              { $lte: ["$RegistrationDate", toDate] },
            ],
          },
        },
      },
      {
        $addFields: {
          year: { $year: "$RegistrationDate" },
        },
      },
      {
        $group: {
          _id: {
            // microMarket: "$microMarket",
            DocumentName: "$DocumentName",
            year: "$year",
          },
          totalAmount: { $sum: "$MarketPrice" },
        },
      },
      {
        $group: {
          _id: "$_id.DocumentName",
          yearsData: {
            $push: {
              year: "$_id.year",
              totalAmount: "$totalAmount",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          data: {
            $map: {
              input: lastFiveYears,
              as: "year",
              in: {
                $cond: [
                  { $in: ["$$year", "$yearsData.year"] },
                  {
                    $arrayElemAt: [
                      "$yearsData.totalAmount",
                      {
                        $indexOfArray: ["$yearsData.year", "$$year"],
                      },
                    ],
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    ]);

    const obj = {
      res,
      msg: Constant.INFO_MSGS.SUCCESS,
      status: Constant.STATUS_CODE.OK,
      data: {
        data,
        years: lastFiveYears,
      },
    };
    return Response.success(obj);
  } catch (error) {
    console.log(error);
    return handleException(logger, res, error);
  }
};

const findQuarterlyAndYearlyRegistries = async (req, res) => {
  const { logger } = req;

  try {
    const { cityId } = req.query;

    if (!cityId) {
      const obj = {
        res,
        status: Constant.STATUS_CODE.BAD_REQUEST,
        msg: `"cityId" is ${Constant.INFO_MSGS.MSG_REQUIRED} in query!`,
      };
      return Response.error(obj);
    }

    // Subtract 5 years from the current date
    const fiveYearsAgo = new Date();
    fiveYearsAgo
      .setFullYear(fiveYearsAgo.getFullYear() - 4, 0, 1)
      .toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    fiveYearsAgo.setUTCHours(0, 0, 0, 0); // 00:00:00.000 UTC

    const toDate = new Date();
    toDate
      .setFullYear(toDate.getFullYear() - 0, 11, 31)
      .toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    toDate.setUTCHours(23, 59, 59, 999); // 23:59:59.999 UTC

    // toDate;;

    // const currentYear = (new Date()).getFullYear();
    // const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step));
    // const lastFiveYears = range(currentYear, currentYear - 5, -1);
    // lastFiveYears.shift();

    const data = await registry.aggregate([
      {
        $match: {
          city: ObjectId(cityId),
          $expr: {
            $and: [
              { $gte: ["$RegistrationDate", fiveYearsAgo] },
              { $lte: ["$RegistrationDate", toDate] },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "cities",
          localField: "city",
          foreignField: "_id",
          as: "cityData",
        },
      },
      {
        $addFields: {
          year: { $year: "$RegistrationDate" },
          quarter: {
            $ceil: {
              $divide: [
                {
                  $subtract: [{ $month: "$RegistrationDate" }, 1],
                },
                3,
              ],
            },
          },
        },
      },
      {
        $group: {
          _id: {
            year: "$year",
            quarter: "$quarter",
          },
          city: { $first: "$city" },
          name: { $first: "$cityData.cityTitle" },
          // count: { $sum: 1 },
          sqf: { $sum: "$SquareFeet" },
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
          },
          city: { $first: "$city" },
          name: { $first: "$name" },
          sqf: { $sum: "$sqf" },
          quarterWise: {
            $push: {
              quarter: "$_id.quarter",
              sqf: "$sqf",
            },
          },
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
          },
          cityWise: {
            $push: {
              city: "$city",
              name: { $arrayElemAt: ["$name", 0] },
              sqf: "$sqf",
              quarterWise: "$quarterWise",
            },
          },
        },
      },
      { $unwind: "$cityWise" },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          cityWise: {
            $let: {
              vars: {
                quarters: {
                  $map: {
                    input: { $range: [0, 4] },
                    as: "quarter",
                    in: {
                      $let: {
                        vars: {
                          foundQuarter: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$cityWise.quarterWise",
                                  cond: {
                                    $eq: ["$$this.quarter", "$$quarter"],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: {
                          quarter: "$$quarter",
                          // count: { $ifNull: ["$$foundQuarter.count", 0] },
                          sqf: {
                            $ifNull: ["$$foundQuarter.sqf", 0],
                          },
                        },
                      },
                    },
                  },
                },
              },
              in: {
                city: "$cityWise.city",
                name: "$cityWise.name",
                // count: "$cityWise.count",
                sqf: "$cityWise.sqf",
                quarterWise: "$$quarters",
              },
            },
          },
        },
      },
      {
        $sort: {
          year: 1,
        },
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

const getSquareFeetByMicroMarket = async (req, res) => {
  const { logger } = req;

  try {
    let { cityId, to, from } = req.query;

    if (!cityId || !to || !from) {
      const obj = {
        res,
        status: Constant.STATUS_CODE.BAD_REQUEST,
        msg: `"cityId", "to" and "from" ${Constant.INFO_MSGS.MSG_REQUIRED} in query!`,
      };
      return Response.error(obj);
    }

    // Subtract 5 years from the current date
    // console.log(to, from);
    const fromDate = new Date(from);
    fromDate
      .setUTCHours(0, 0, 0, 0)
      .toLocaleString("en-US", { timeZone: "Asia/Kolkata" }); // 00:00:00.000 UTC

    const toDate = new Date(to);
    toDate
      .setUTCHours(23, 59, 59, 999)
      .toLocaleString("en-US", { timeZone: "Asia/Kolkata" }); // 23:59:59.999 UTC

    const toYear = new Date(to).getFullYear();
    const range = (start, stop, step) =>
      Array.from(
        { length: (stop - start) / step + 1 },
        (_, i) => start + i * step
      );
    const years = range(toYear, new Date(from).getFullYear(), -1);

    // console.log(toYear, new Date(from).getFullYear());

    const data = await registry.aggregate([
      {
        $match: {
          city: ObjectId(cityId),
          $expr: {
            $and: [
              { $gte: ["$RegistrationDate", fromDate] },
              { $lte: ["$RegistrationDate", toDate] },
            ],
          },
        },
      },
      {
        $addFields: {
          year: { $year: "$RegistrationDate" },
        },
      },
      {
        $group: {
          _id: {
            microMarket: "$microMarket",
            year: "$year",
          },
          sqf: { $sum: "$totalSquareFeet" },
        },
      },
      {
        $group: {
          _id: "$_id.microMarket",
          yearsData: {
            $push: {
              year: "$_id.year",
              sqf: "$sqf",
            },
          },
        },
      },
      {
        $lookup: {
          from: "newmicromarkets",
          localField: "_id",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 1,
                microMarketTitle: 1,
              },
            },
          ],
          as: "microMarketInfo",
        },
      },
      { $unwind: "$microMarketInfo" },
      {
        $project: {
          _id: 0,
          // microMarketInfo: 1,
          market: "$microMarketInfo.microMarketTitle",
          data: {
            $map: {
              input: years,
              as: "year",
              in: {
                $cond: [
                  { $in: ["$$year", "$yearsData.year"] },
                  {
                    $arrayElemAt: [
                      "$yearsData.sqf",
                      {
                        $indexOfArray: ["$yearsData.year", "$$year"],
                      },
                    ],
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    ]);

    const obj = {
      res,
      msg: Constant.INFO_MSGS.SUCCESS,
      status: Constant.STATUS_CODE.OK,
      data: {
        data,
        years: years,
      },
    };
    return Response.success(obj);
  } catch (error) {
    console.log(error);
    return handleException(logger, res, error);
  }
};

const rentValueByMicromarket = async (req, res) => {
  const { logger } = req;

  try {
    const { cityId, to, from, selectedType } = req.query;
    const userPropertyType = req.decoded.PropertyType;
    let qry = {};
    if (
      userPropertyType === "commercial" ||
      userPropertyType === "residential"
    ) {
      qry.buildingType = userPropertyType;
    } else if (userPropertyType === "both") {
      if (selectedType === "commercial") {
        qry.buildingType = "commercial";
      } else if (selectedType === "residential") {
        qry.buildingType = "residential";
      }
    }
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
          ...qry,
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
          _id: "$microMarket",
          rate: { $sum: "$MarketPrice" },
          microMarketId: {
            $first: "$microMarket",
          },
        },
      },
      {
        $lookup: {
          from: "newmicromarkets",
          localField: "microMarketId",
          foreignField: "_id",
          as: "microMarketData",
        },
      },
      {
        $unwind: "$microMarketData",
      },
      {
        $project: {
          // _id: 1,
          name: "$microMarketData.microMarketTitle",
          rate: 1,
        },
      },
      {
        $group: {
          _id: "$name",
          totalRate: { $sum: "$rate" },
          microMarkets: {
            $push: {
              microMarketId: "$_id",
              rate: "$rate",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          totalRate: 1,
        },
      },
      {
        $sort: {
          totalRate: -1,
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

const upcommingSupply = async (req, res) => {
  const { logger } = req;

  try {
    const { cityId, to, from } = req.query;
    const userPropertyType = req.decoded.PropertyType;
    let qry = {};
    if (
      userPropertyType === "commercial" ||
      userPropertyType === "residential"
    ) {
      qry.buildingType = userPropertyType;
    } else if (userPropertyType === "both") {
      qry.buildingType = { $in: ["commercial", "residential"] };
    }
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
          // city: ObjectId(cityId),
          ...qry,
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
          _id: "$microMarket",
          sqf: { $sum: "$totalSquareFeet" },
          microMarketId: {
            $first: "$microMarket",
          },
          buildings: { $addToSet: "$buildingId" },
        },
      },
      {
        $lookup: {
          from: "newmicromarkets",
          localField: "microMarketId",
          foreignField: "_id",
          as: "microMarketData",
        },
      },
      {
        $unwind: "$microMarketData",
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
            $first: "$microMarketData.microMarketTitle",
          },
          totalSquareFeet: {
            $sum: "$buildingDetails.totalSquareFeet",
          },
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

module.exports = {
  getSquareFeet,
  //   getTop10Locality,
  getCurrunt50registry,
  getTotalStock,
  findDemand,
  findTopSupply,
  findYield,
  findQuarterlyAndYearlyRegistries,
  getSquareFeetByMicroMarket,
  findTopSupplyByYears,
  rentValueByMicromarket,
  upcommingSupply,
};
