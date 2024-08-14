const { handleException } = require('../../../helpers/exception');
const building = require("../../../models/building");
const Response = require('../../../helpers/response');
const Constant = require("../../../helpers/constant");
const _ = require("underscore");

const getBuildingInRadius = async (req, res) => {
      const { logger } = req;
      try {
            const userPropertyType = req.decoded.PropertyType;
            let {
                  radius,
                  lat,
                  long,
                  minSize,
                  maxSize,
                  minRate,
                  maxRate,
                  status,
                  page,
                  limit,
                  selectedType,
            } = req.query;

            if (!radius || !lat || !long) {
                  return res.status(400).json({ message: "Radius, lat and long is mandatory fields", status: 400 });
            }
            let qry = {};
            if (status) qry["buildingStatus"] = status;
            if (minSize && maxSize) {
                  qry["floorPlateCarpet"] = {
                        $gte: parseInt(minSize),
                        $lte: parseInt(maxSize),
                  };
            }
            if (minRate && maxRate) {
                  qry["rate"] = {
                        $gte: parseInt(minRate),
                        $lte: parseInt(maxRate),
                  };
            }

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

            offset = page || 1;
            limit = parseInt(limit) || 20;
            const skip = limit * (offset - 1);



            let promise1 = new Promise((resolve, reject) => {

                  let getRadiusData = building.aggregate([
                        {
                              $geoNear: {
                                    near: {
                                          type: "Point",
                                          coordinates: [
                                                parseFloat(lat),
                                                parseFloat(long)
                                          ]
                                    },
                                    distanceField: "distance",
                                    maxDistance: radius * 1000, // convert radius from km to meters
                                    spherical: true
                              }
                        },
                        { $match: { ...qry, archive: false, isRegistryPresent: true } },
                        { $sort: { updatedAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                              $project: {
                                    location: 1,
                                    locality: 1,
                                    BuildingName: 1,
                                    buildingStatus: 1,
                                    buildingStats: 1,
                                    buildingStructure: 1,
                                    buildingClassification: 1,
                                    totalSquareFeet: 1,
                                    totalRegistryTransaction: 1,
                                    avgRentRate: 1,
                                    avgSaleRate: 1,
                              }
                        }
                  ]);

                  resolve(getRadiusData)
            });

            let promise2 = new Promise((resolve, reject) => {

                  let totalCount = building.aggregate([
                        {
                              $geoNear: {
                                    near: {
                                          type: "Point",
                                          coordinates: [
                                                parseFloat(lat),
                                                parseFloat(long)
                                          ]
                                    },
                                    distanceField: "distance",
                                    maxDistance: radius * 1000, // convert radius from km to meters
                                    spherical: true
                              }
                        },
                        { $match: { ...qry, archive: false, isRegistryPresent: true } },
                        { $count: "totalCount" }

                  ]);

                  resolve(totalCount)

            });

            let values = await Promise.all([promise1, promise2]);

            if (_.isEmpty(values[0] || values[0][1])) {
                  const obj = {
                        res,
                        msg: Constant.INFO_MSGS.NO_DATA,
                        status: Constant.STATUS_CODE.OK,
                        data: [],
                  };
                  return Response.success(obj);
            } else {
                  const obj = {
                        res,
                        status: Constant.STATUS_CODE.OK,
                        msg: Constant.INFO_MSGS.SUCCESS,
                        data: {
                              transactionData: values[0],
                              totalCount: values[1][0].totalCount
                        }
                  };
                  return Response.success(obj);
            }
      } catch (error) {
            console.log('error', error)
            return handleException(logger, res, error);
      }
};


module.exports = {
      getBuildingInRadius,
}