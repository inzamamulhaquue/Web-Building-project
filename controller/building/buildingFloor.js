const { handleException } = require("../../helpers/exception");
const Response = require("../../helpers/response");
const Constant = require("../../helpers/constant");
const BuildingFloorModel = require("../../models/buildingFloor");
const NewBuildingFloorModel = require("../../models/newBuildingFloor");
// const floorTestModel = require("../../models/floorTest");
const buildingModel = require("../../models/building");
const registryModel = require("../../models/registry");
const _ = require("underscore");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const getLetestTrans = async (req, res) => {
  const { logger } = req;
  try {
    let { buildingId, floor, flatNo } = req.body;
    // let getRegistryData = await registryModel.find({ buildingId, MalaNo, FlatNo });
    const qry = {};
    qry["$and"] = [
      { buildingId: ObjectId(buildingId) },
      { MalaNo: floor },
      { FlatNo: flatNo },
    ];
    let getRegistryData = await registryModel.aggregate([{ $match: qry }]);

    if (getRegistryData.length > 0) {
      const obj = {
        res,
        msg: Constant.INFO_MSGS.SUCCESS,
        status: Constant.STATUS_CODE.OK,
        data: getRegistryData[0],
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

const getByIdBuildingFloor = async (req, res) => {
  const { logger } = req;
  try {
    let { sortBy, str, page, limit, building } = req.query;
    if (_.isUndefined(str)) str = "";
    if (sortBy === "recent") {
      sortBy = { createdAt: -1 };
    } else {
      sortBy = { createdAt: 1 };
    }
    offset = page || 1;
    limit = limit || 20;
    const skip = limit * (offset - 1);
    const buildingData = await BuildingFloorModel.aggregate([
      {
        $match: { buildingId: ObjectId(building) },
      },
      { $sort: sortBy },
      {
        $facet: {
          paginatedResult: [{ $skip: skip }, { $limit: parseInt(limit) }],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);
    if (_.isEmpty(buildingData[0].paginatedResult)) {
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
        data: buildingData[0].paginatedResult,
        pagination: {
          offset: parseInt(offset),
          limit: parseInt(limit),
          total: buildingData[0].totalCount[0].count,
        },
      },
    };

    return Response.success(obj);
  } catch (error) {
    console.log("error", error);
    return handleException(logger, res, error);
  }
};

const getAllBuildingFloor = async (req, res) => {
  const { logger } = req;
  try {
    let { sortBy, str, page, limit } = req.query;
    if (sortBy === "recent") {
      sortBy = { createdAt: -1 };
    } else {
      sortBy = { createdAt: 1 };
    }
    offset = page || 1;
    limit = limit || 20;
    const skip = limit * (offset - 1);
    const BuildingFloorData = await BuildingFloorModel.aggregate([
      { $sort: sortBy },
      {
        $facet: {
          paginatedResult: [{ $skip: skip }, { $limit: parseInt(limit) }],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);
    if (_.isEmpty(BuildingFloorData[0].paginatedResult)) {
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
        data: BuildingFloorData[0].paginatedResult,
        pagination: {
          offset: parseInt(offset),
          limit: parseInt(limit),
          total: BuildingFloorData[0].totalCount[0].count,
        },
      },
    };

    return Response.success(obj);
  } catch (error) {
    console.log("error", error);
    return handleException(logger, res, error);
  }
};

const getBuildingFloorsByBuildingId = async (req, res) => {
	const { logger } = req;

	try {
		let buildingId = req.params.id;

		let floorAggregationPipeline = [
			{ $match: { buildingId: ObjectId(buildingId) } },

			{
				$group: {
					_id: "$floorNo",
					flatData: {
						$push: {
							flatNo: "$flatNo",
							createdAt: "$createdAt",
              expiryDate: "$expiryDate",
              chargeable: "$chargeable",
              carpetArea: "$carpetArea",
              documentType: "$documentType",
              unitStatus: "$unitStatus",
						},
					},
				},
			},
			{
				$project: {
					flatData: 1,
					floorNo: { $toInt: "$_id" },
					_id: 0,
				},
			},
			{
				$sort: {
					floorNo: 1,
				},
			},
		];

		let buildingAggregationPipeline = [
			{ $match: { _id: ObjectId(buildingId) } },
			{
				$project: {
					_id: 0,
					buildingStructure: 1,
				},
			},
		];

		let floorData = {};
    
    await NewBuildingFloorModel.aggregate(floorAggregationPipeline).then(
			(data) => {
				data.forEach((item) => {
					floorData[item.floorNo] = item.flatData;
				});
			}
		);

    let result = await buildingModel.aggregate(buildingAggregationPipeline);
		let buildingStructure =
			result.length > 0 ? result[0]?.buildingStructure : "";

		let floorStructure = {};

    if (buildingStructure) {
			buildingStructure = buildingStructure.toUpperCase().split("+");
			buildingStructure.forEach((item) => {
				if (item.includes("P") || item.includes("B")) {
					floorStructure["totalBasement"] = item.replace("P", "")
						? parseInt(item.replace("P", ""))
						: 1;
				} else if (item.includes("G")) {
					floorStructure["totalGround"] = item.replace("G", "")
						? parseInt(item.replace("G", ""))
						: 1;
				} else {
					floorStructure["totalFloors"] = parseInt(item);
				}
			});
		}

		obj = {
			res,
			msg: Constant.INFO_MSGS.SUCCESS,
			status: Constant.STATUS_CODE.OK,
			data: { floorData, buildingStructure: floorStructure },
		};

		return Response.success(obj);
	} catch (error) {
		console.log("error", error);
		return handleException(logger, res, error);
	}
};

module.exports = {
  getByIdBuildingFloor,
  getAllBuildingFloor,
  getLetestTrans,
  getBuildingFloorsByBuildingId
};
