const { handleException } = require('../../../helpers/exception');
const registry = require("../../../models/registry");
const Response = require('../../../helpers/response');
const Constant = require("../../../helpers/constant");
const _ = require("underscore");

const getRegistriesRadius = async (req, res) => {
      const { logger } = req;
     
      try {

            const { userId } = req.decoded;
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
            if (status) qry["Status"] = status;
            if (minSize && maxSize) {
                  qry["SquareFeet"] = {
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

            let promise1 = new Promise((resolve, reject)=>{

                  let getRadiusData =  registry.aggregate([
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
                        { $match: { ...qry, archive: false } },
                        { $sort: { updatedAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                              $lookup: {
                                    from: "registryviews",
                                    localField: "_id",
                                    foreignField: "registryId",
                                    as: "registryInfo",
                              },
                        },
                        {
                              $project: {
                                    BuildingName: 1,
                                    DocumentType: 1,
                                    RegistrationDate: 1,
                                    expiryDate: 1,
                                    MalaNo: 1,
                                    FlatNo: 1,
                                    unit_status: 1,
                                    rent_rate: 1,
                                    sale_rate: 1,
                                    charageable_squareFeet: 1,
                                    location: 1,
                                    status: {
                                          $map: {
                                                input: "$registryInfo.user_list.userId",
                                                as: "userId",
                                                in: {
                                                      $cond: {
                                                            if: { $in: [userId, "$$userId"] },
                                                            then: { $literal: "unseen" },
                                                            else: { $literal: "seen" }
                                                      }
                                                }
                                          }
                                    },
                              }
                        }
                  ]);

                  resolve(getRadiusData)
            });

            let promise2 = new Promise( (resolve, reject)=>{

                  let totalCount =  registry.aggregate([
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
                        { $match: { ...qry, archive: false } },
                        { $count: "totalCount"}
                  ])

                  resolve(totalCount)
            })

            const values = await Promise.all([promise1, promise2]);

            if (_.isEmpty(values[0] || values[0][1])) {
                  const obj = {
                        res,
                        msg: Constant.INFO_MSGS.NO_DATA ,
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
                              transactionData : values[0],
                              totalCount : values[1][0].totalCount
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
      getRegistriesRadius,
}