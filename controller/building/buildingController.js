const { handleException } = require("../../helpers/exception");
const Response = require("../../helpers/response");
const Constant = require("../../helpers/constant");
const building = require("../../models/building");
const registry = require("../../models/registry");
const registryCopy = require("../../models/registryCopy");
const microMarketModel = require("../../models/microMarket");
const newMicroMarketModel = require("../../models/newMicroMarket");
const { S3 } = require("@aws-sdk/client-s3");
const _ = require("underscore");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const bucketName = process.env.AWS_BUCKET;

// // *****************************************
const getBuildingById = async (req, res) => {
  const { logger } = req;

  try {
    const _id = req.params.id;
    const { userId } = req.decoded;
    const aggregationPipeline = [
      {
        $match: { _id: mongoose.Types.ObjectId(_id) },
      },
      {
        $lookup: {
          from: "tracks",
          pipeline: [
            {
              $match: {
                userId: ObjectId(userId),
              },
            },
          ],
          as: "tracksData",
        },
      },
      {
        $unwind: {
          path: "$tracksData",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $addFields: {
          trackUserList: {
            $map: {
              input: "$tracksData.building",
              as: "track",
              in: "$$track",
            },
          },
        },
      },
      {
        $lookup: {
          from: "registries",
          localField: "_id",
          foreignField: "buildingId",
          pipeline: [{ $match: { archive: false } }],
          as: "registriesData",
        },
      },
      {
        $lookup: {
          from: "registries",
          localField: "_id",
          foreignField: "buildingId",
          pipeline: [
            { $match: { DocumentType: "Sale" } },
            {
              $sort: { RegistrationDate: -1 },
            },
            {
              $limit: 1,
            },
          ],
          as: "mostRecentRegistry",
        },
      },
      {
        $lookup: {
          from: "registries",
          localField: "_id",
          foreignField: "buildingId",
          pipeline: [
            { $match: { archive: false } },
            {
              $group: {
                _id: "$FlatNo", // Group by flat number
                totalSqft: { $first: "$SquareFeet" }, // Keep the first occurrence of sqft for each flat
              },
            },
          ],
          as: "totalsqft",
        },
      },
      {
        $lookup: {
          from: "assets",
          localField: "_id",
          foreignField: "id",
          pipeline: [
            {
              $project: {
                url: 1,
                type: 1,
              },
            },
          ],
          as: "assetsData",
        },
      },
      {
        $lookup: {
          from: "newmicromarkets",
          localField: "microMarket",
          foreignField: "_id",
          as: "microMarketData",
        },
      },
      {
        $unwind: {
          path: "$microMarketData",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          BuildingName: 1,
          Address: 1,
          PlotNo: 1,
          MalaNo: 1,
          BlockNo: 1,
          PinCode: 1,
          Others: 1,
          buildingAge: 1,
          totalSquareFeet: { $sum: "$totalsqft.totalSqft" },
          totalFloor: 1,
          totalFlat: 1,
          totalRegistryTransaction: { $size: "$registriesData" },
          avgCAM: { $avg: "$registriesData.CAM_Or_Common_Area_Maintenance" },
          totalRegistryAmount: { $sum: "$registriesData.sale_value" },
          avgRentRate: { $avg: "$registriesData.rent_rate" },
          avgSaleRate: { $avg: "$registriesData.sale_rate" },
          developer: 1,
          long: 1,
          lat: 1,
          buildingType: 1,
          buildingStats:1,
          buildingStatus: 1,
          rent: { $sum: "$registriesData.rate" },
          createdAt: 1,
          updatedAt: 1,
          tracksData: {
             track: { $in: ["$_id", "$trackUserList"] },
          },
          assets: "$assetsData",
          microMarket_Id: "$microMarketData._id",
          microMarket: "$microMarketData",
          locality: 1,
          area: 1,
          PropertyDescription: 1,
          proposedAvailabilityDate: 1,
          floorplateChargeable: 1,
          floorPlateCarpet: 1,
          chargeableSqft: 1,
          carpetSqft: 1,
          marketPrice: 1,
          amenities: 1,
          commonAreaMaintenance: 1,
          location: 1,
          buildingStructure: 1,
          DeclaredCircleRate: {
            $arrayElemAt: ["$mostRecentRegistry.DeclaredCircleRate", 0],
          },
          // DeclaredCircleRate:1,
          buildingClassification:1,
          CTS_No: 1,
          aCType:1,
          powerBackup:1,
          buildingTwoWheelerParking: 1,
          buildingFourWheelerParking:1,
          CAMChargeable:1,
          commonCafeteria:1,
          PropertyDescription:1,
        },
      },
    ];

    const buildingData = await building.aggregate(aggregationPipeline);
  
    if (!buildingData) {
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
        data: buildingData,
      };
      return Response.success(obj);
    }
  } catch (error) {
    console.log("error", error);
    return handleException(logger, res, error);
  }
};

const getAllBuilding = async (req, res) => {
  const { logger } = req;
  try {
    let {
      query,
      offset,
      limit,
      status,
      minSize,
      maxSize,
      minRent,
      maxRent,
      state,
      city,
      address,
      VillageName,
      locality,
      developer,
      microMarket,
      selectedType,
      globalSearch,
      microMarketIds,
    } = req.query;

    if (_.isUndefined(query)) query = "";
    const { userId } = req.decoded;
    const userPropertyType = req.decoded.PropertyType;
    let qry = {};
    var pinArr = [];

    if (globalSearch) {
      const searchFields = [
        { BuildingName: { $regex: `^${globalSearch}`, $options: "i" } },
        { PropertyDescription: { $regex: `^${globalSearch}`, $options: "i" } },
        { VillageName: { $regex: `^${globalSearch}`, $options: "i" } },
        { locality: { $regex: `^${globalSearch}`, $options: "i" } },
        { Address: { $regex: `^${globalSearch}`, $options: "i" } },
        { PlotNo: { $regex: `^${globalSearch}`, $options: "i" } },
        { MalaNo: { $regex: `^${globalSearch}`, $options: "i" } },
        { BlockNo: { $regex: `^${globalSearch}`, $options: "i" } },
        { PinCode: { $regex: `^${globalSearch}`, $options: "i" } },
        { Others: { $regex: `^${globalSearch}`, $options: "i" } },
        { buildingAge: { $regex: `^${globalSearch}`, $options: "i" } },
        { totalSquareFeet: { $regex: `^${globalSearch}`, $options: "i" } },
        { totalFloor: { $regex: `^${globalSearch}`, $options: "i" } },
        { totalFlat: { $regex: `^${globalSearch}`, $options: "i" } },
        {
          totalRegistryTransaction: {
            $regex: `^${globalSearch}`,
            $options: "i",
          },
        },
        { developer: { $regex: `^${globalSearch}`, $options: "i" } },
        { buildingType: { $regex: `^${globalSearch}`, $options: "i" } },
        { selectedType: { $regex: `^${globalSearch}`, $options: "i" } },
        { buildingStatus: { $regex: `^${globalSearch}`, $options: "i" } },
        { lat: { $regex: `^${globalSearch}`, $options: "i" } },
        { long: { $regex: `^${globalSearch}`, $options: "i" } },
        { city: { $regex: `^${globalSearch}`, $options: "i" } },
        { state: { $regex: `^${globalSearch}`, $options: "i" } },
        { rent: { $regex: `^${globalSearch}`, $options: "i" } },
        { assetsId: { $regex: `^${globalSearch}`, $options: "i" } },
        { efficiency: { $regex: `^${globalSearch}`, $options: "i" } },
        { loading: { $regex: `^${globalSearch}`, $options: "i" } },
        {
          commercialsChargeable: { $regex: `^${globalSearch}`, $options: "i" },
        },
        { commercialsCarpet: { $regex: `^${globalSearch}`, $options: "i" } },
        { CAMChargeable: { $regex: `^${globalSearch}`, $options: "i" } },
        { CAMCarpet: { $regex: `^${globalSearch}`, $options: "i" } },
        { commonCafeteria: { $regex: `^${globalSearch}`, $options: "i" } },
        { powerBackup: { $regex: `^${globalSearch}`, $options: "i" } },
        { aCType: { $regex: `^${globalSearch}`, $options: "i" } },
        { remarks: { $regex: `^${globalSearch}`, $options: "i" } },
        {
          commonAreaMaintenance: { $regex: `^${globalSearch}`, $options: "i" },
        },
        { marketPrice: { $regex: `^${globalSearch}`, $options: "i" } },
        { floorPlateCarpet: { $regex: `^${globalSearch}`, $options: "i" } },
        { floorplateChargeable: { $regex: `^${globalSearch}`, $options: "i" } },
        {
          proposedAvailabilityDate: {
            $regex: `^${globalSearch}`,
            $options: "i",
          },
        },
        { microMarket: { $regex: `^${globalSearch}`, $options: "i" } },
        { location: { $regex: `^${globalSearch}`, $options: "i" } },
      ];
      qry["$or"] = searchFields;
    }
    // if (query) {
    //   qry["$or"] = [{ BuildingName: { $regex: query, $options: "i" } }];
    // }

    if (query) {
      qry = { ...qry, BuildingName: { $regex: `^${query}`, $options: "i" }  };
    }
    if (address) {
        qry = { ...qry, Address: { $regex: `^${address}`, $options: "i" }  };
    }
    if (VillageName) {
        qry = { ...qry, VillageName: { $regex: `^${VillageName}`, $options: "i" }  };
    }

    if (locality) {
        qry = { ...qry, locality: locality };
    }

    if (developer) {
        qry = { ...qry, developer: { $regex: `^${developer}`, $options: "i" }  };
    }

    if (state) {
      qry["$and"] = qry["$and"]
        ? [...qry["$and"], { state: ObjectId(state) }]
        : [{ state: ObjectId(state) }];
    }

    if (city) {
      qry["$and"] = qry["$and"]
        ? [...qry["$and"], { city: ObjectId(city) }]
        : [{ city: ObjectId(city) }];
    }
    if (microMarketIds) {
      microMarketIds = microMarketIds.split(","); 
      qry["$and"] = qry["$and"]
        ? [
            ...qry["$and"],
            { microMarketId: { $in: microMarketIds.map(ObjectId) } },
          ]
        : [{ microMarketId: { $in: microMarketIds.map(ObjectId) } }];
    }
    if (microMarket) {
      qry["$and"] = qry["$and"]
        ? [...qry["$and"], { microMarket: ObjectId(microMarket) }]
        : [{ microMarket: ObjectId(microMarket) }];
    }

    if (status){
      qry = { ...qry, buildingStatus : { $regex: `^${status}`, $options: "i" }  };
    } 

    if (minSize && maxSize) {
      qry["floorPlateCarpet"] = {
        $gte: parseInt(minSize),
        $lte: parseInt(maxSize),
      };
    }
    if (minRent && maxRent) {
      qry["rent"] = {
        $gte: parseInt(minRent),
        $lte: parseInt(maxRent),
      };
    }

    if (userPropertyType === "commercial") {
      qry.buildingType = "commercial";
    } else if (userPropertyType === "residential") {
      qry.buildingType = "residential";
    } else if (userPropertyType === "both" && selectedType) {
      qry.buildingType = selectedType;
    }

    offset = offset || 1;
    limit = parseInt(limit) || 20;
    const skip = limit * (offset - 1);
    let aggregationPipeline = [
      {
        $match: { ...qry, archive: false, isRegistryPresent: true },
      },
      { $sort: { _id: -1 } },
      {
        $skip: skip, // Incorporating $skip in the pipeline
      },
      {
        $limit: limit, // Incorporating $limit in the pipeline
      },
      {
        $lookup: {
          from: "tracks",
          pipeline: [
            {
              $match: {
                userId: ObjectId(userId),
              },
            },
          ],
          as: "tracksData",
        },
      },
      {
        $lookup: {
          from: "registries",
          localField: "_id",
          foreignField: "buildingId",
          pipeline: [{ $match: { archive: false } }],
          as: "registriesData",
        },
      },
      {
        $lookup: {
          from: "registries",
          localField: "_id",
          foreignField: "buildingId",
          pipeline: [
            { $match: { archive: false } },
            {
              $group: {
                _id: "$FlatNo", // Group by flat number
                totalSqft: { $first: "$SquareFeet" }, // Keep the first occurrence of sqft for each flat
              },
            },
          ],
          as: "totalsqft",
        },
      },
      // {
      //   $match: {
      //     // Filter out documents where registriesData is an empty array
      //     registriesData: { $ne: [] },
      //   },
      // },
      {
        $project: {
          _id: 1,
          BuildingName: 1,
          Address: 1,
          PlotNo: 1,
          MalaNo: 1,
          FlatNo: 1,
          DocumentName: 1,
          RegistrationDate: 1,
          BlockNo: 1,
          PinCode: 1,
          Others: 1,
          buildingAge: 1,
          totalSquareFeet: { $sum: "$totalsqft.totalSqft" },
          totalFloor: 1,
          totalFlat: 1,
          totalRegistryTransaction: { $size: "$registriesData" },
          avgRentRate: {$avg:"$registriesData.rent_rate"}, 
          avgSaleRate: {$avg:"$registriesData.sale_rate"},
          // avgRent:  {$divide: [{ $sum: "$registriesData.rent_purchaser_fees" }, { $sum: "$registriesData.charageable_squareFeet" }]},
          // avgSale:  {$divide: [{ $sum: "$registriesData.sale_value" }, { $sum: "$registriesData.charageable_squareFeet" }]},
          developer: 1,
          buildingType: 1,
          buildingStats:1,
          buildingStatus: 1,
          rent: 1,
          createdAt: 1,
          updatedAt: 1,
          city: 1,
          state: 1,
          microMarketId: 1,
          // assets: "$assetsData",
          // microMarket_Id: "$microMarketData._id",
          // microMarket: "$microMarketData",
          locality: 1,
          registriesData: 1,
          marketPrice: 1,
          buildingStructure: 1,
          buildingClassification: 1,
          CTS_No: 1,       
          tracksData: {
            $map:{
              input: "$tracksData.building",
              as: "buildingId",
              in:{
                $cond:{
                  if:{ $in: ["$_id", "$$buildingId"]},
                  then: true,
                  else: false
                }
              }
            }
          }
        },
      },
    ];


    
    const promise1 = new Promise((resolve, reject) => {
      
      const buildingData = building.aggregate(aggregationPipeline, {
        allowDiskUse: true,
      });
      resolve(buildingData)
    });

    const promise2 = new Promise((resolve, reject) => {
     
      const buildingTotal =  building.aggregate([
        {
          $match: { ...qry, archive: false, isRegistryPresent: true },
        },
        { $count: "totalCount" },
      ]);
      resolve(buildingTotal)
    });

    const values = await Promise.all([promise1, promise2]);

    if (_.isEmpty(values[0] || values[0][1])) {
      obj = {
        res,
        status: Constant.STATUS_CODE.OK,
        msg: Constant.INFO_MSGS.ITEMS_NOT_AVAILABLE,
        data: {
          buildingData: [],
          pagination: {
            offset: parseInt(offset),
            limit: parseInt(limit),
            total: 0,
          },
        },
      };
      return Response.success(obj);
    };
    obj = {
      res,
      msg: Constant.INFO_MSGS.SUCCESS,
      status: Constant.STATUS_CODE.OK,
      data: {
        buildingData: values[0],
        pagination: {
          offset: parseInt(offset),
          limit: parseInt(limit),
          total: values[1][0].totalCount,
        },
      },
    };

    return Response.success(obj);
  } catch (error) {
    console.log("error", error);
    return handleException(logger, res, error);
  }
};

const buildingAutoComplete = async (req, res) => {
  const { logger } = req;
  try {
    let {
      query,
      offset,
      limit,
      status,
      minSize,
      maxSize,
      minRent,
      maxRent,
      state,
      city,
      address,
      VillageName,
      locality,
      developer,
      microMarket,
      selectedType,
      globalSearch,
      microMarketIds,
    } = req.query;

    if (_.isUndefined(query)) query = "";
    const { userId } = req.decoded;
    const userPropertyType = req.decoded.PropertyType;
    let qry = {};
    var pinArr = [];

    if (globalSearch) {
      const searchFields = [
        { BuildingName: { $regex: `^${globalSearch}`, $options: "i" } },
        { PropertyDescription: { $regex: `^${globalSearch}`, $options: "i" } },
        { VillageName: { $regex: `^${globalSearch}`, $options: "i" } },
        { locality: { $regex: `^${globalSearch}`, $options: "i" } },
        { Address: { $regex: `^${globalSearch}`, $options: "i" } },
        { PlotNo: { $regex: `^${globalSearch}`, $options: "i" } },
        { MalaNo: { $regex: `^${globalSearch}`, $options: "i" } },
        { BlockNo: { $regex: `^${globalSearch}`, $options: "i" } },
        { PinCode: { $regex: `^${globalSearch}`, $options: "i" } },
        { Others: { $regex: `^${globalSearch}`, $options: "i" } },
        { buildingAge: { $regex: `^${globalSearch}`, $options: "i" } },
        { totalSquareFeet: { $regex: `^${globalSearch}`, $options: "i" } },
        { totalFloor: { $regex: `^${globalSearch}`, $options: "i" } },
        { totalFlat: { $regex: `^${globalSearch}`, $options: "i" } },
        {
          totalRegistryTransaction: {
            $regex: `^${globalSearch}`,
            $options: "i",
          },
        },
        { developer: { $regex: `^${globalSearch}`, $options: "i" } },
        { buildingType: { $regex: `^${globalSearch}`, $options: "i" } },
        { selectedType: { $regex: `^${globalSearch}`, $options: "i" } },
        { buildingStatus: { $regex: `^${globalSearch}`, $options: "i" } },
        { lat: { $regex: `^${globalSearch}`, $options: "i" } },
        { long: { $regex: `^${globalSearch}`, $options: "i" } },
        { city: { $regex: `^${globalSearch}`, $options: "i" } },
        { state: { $regex: `^${globalSearch}`, $options: "i" } },
        { rent: { $regex: `^${globalSearch}`, $options: "i" } },
        { assetsId: { $regex: `^${globalSearch}`, $options: "i" } },
        { efficiency: { $regex: `^${globalSearch}`, $options: "i" } },
        { loading: { $regex: `^${globalSearch}`, $options: "i" } },
        {
          commercialsChargeable: { $regex: `^${globalSearch}`, $options: "i" },
        },
        { commercialsCarpet: { $regex: `^${globalSearch}`, $options: "i" } },
        { CAMChargeable: { $regex: `^${globalSearch}`, $options: "i" } },
        { CAMCarpet: { $regex: `^${globalSearch}`, $options: "i" } },
        { commonCafeteria: { $regex: `^${globalSearch}`, $options: "i" } },
        { powerBackup: { $regex: `^${globalSearch}`, $options: "i" } },
        { aCType: { $regex: `^${globalSearch}`, $options: "i" } },
        { remarks: { $regex: `^${globalSearch}`, $options: "i" } },
        {
          commonAreaMaintenance: { $regex: `^${globalSearch}`, $options: "i" },
        },
        { marketPrice: { $regex: `^${globalSearch}`, $options: "i" } },
        { floorPlateCarpet: { $regex: `^${globalSearch}`, $options: "i" } },
        { floorplateChargeable: { $regex: `^${globalSearch}`, $options: "i" } },
        {
          proposedAvailabilityDate: {
            $regex: `^${globalSearch}`,
            $options: "i",
          },
        },
        { microMarket: { $regex: `^${globalSearch}`, $options: "i" } },
        { location: { $regex: `^${globalSearch}`, $options: "i" } },
      ];
      qry["$or"] = searchFields;
    }
    // if (query) {
    //   qry["$or"] = [{ BuildingName: { $regex: query, $options: "i" } }];
    // }

    if (query) {
      qry = { ...qry, BuildingName: { $regex: `^${query}`, $options: "i" }  };
    }
    if (address) {
        qry = { ...qry, Address: { $regex: `^${address}`, $options: "i" }  };
    }
    if (VillageName) {
        qry = { ...qry, VillageName: { $regex: `^${VillageName}`, $options: "i" }  };
    }

    if (locality) {
        qry = { ...qry, locality: { $regex: `^${locality}`, $options: "i" }  };
    }

    if (developer) {
        qry = { ...qry, developer: { $regex: `^${developer}`, $options: "i" }  };
    }

    if (state) {
      qry["$and"] = qry["$and"]
        ? [...qry["$and"], { state: ObjectId(state) }]
        : [{ state: ObjectId(state) }];
    }

    if (city) {
      qry["$and"] = qry["$and"]
        ? [...qry["$and"], { city: ObjectId(city) }]
        : [{ city: ObjectId(city) }];
    }
    if (microMarketIds) {
      microMarketIds = microMarketIds.split(","); 
      qry["$and"] = qry["$and"]
        ? [
            ...qry["$and"],
            { microMarketId: { $in: microMarketIds.map(ObjectId) } },
          ]
        : [{ microMarketId: { $in: microMarketIds.map(ObjectId) } }];
    }
    if (microMarket) {
      qry["$and"] = qry["$and"]
        ? [...qry["$and"], { microMarket: ObjectId(microMarket) }]
        : [{ microMarket: ObjectId(microMarket) }];
    }

    if (status) qry["buildingStatus"] = status;

    if (minSize && maxSize) {
      qry["floorPlateCarpet"] = {
        $gte: parseInt(minSize),
        $lte: parseInt(maxSize),
      };
    }
    if (minRent && maxRent) {
      qry["rent"] = {
        $gte: parseInt(minRent),
        $lte: parseInt(maxRent),
      };
    }

    if (userPropertyType === "commercial") {
      qry.buildingType = "commercial";
    } else if (userPropertyType === "residential") {
      qry.buildingType = "residential";
    } else if (userPropertyType === "both" && selectedType) {
      qry.buildingType = selectedType;
    }

    offset = offset || 1;
    limit = parseInt(limit) || 20;
    const skip = limit * (offset - 1);
    let aggregationPipeline = [
      {
        $match: { ...qry, archive: false, isRegistryPresent: true },
      },
      { $sort: { _id: -1 } },
      {
        $skip: skip, // Incorporating $skip in the pipeline
      },
      {
        $limit: limit, // Incorporating $limit in the pipeline
      },
      {
        $project: {
          _id: 1,
          BuildingName: 1, 
        },
      },
    ];


    
    const promise1 = new Promise((resolve, reject) => {
      
      const buildingData = building.aggregate(aggregationPipeline, {
        allowDiskUse: true,
      });
      resolve(buildingData)
    });

    const promise2 = new Promise((resolve, reject) => {
     
      const buildingTotal =  building.aggregate([
        {
          $match: { ...qry, archive: false, isRegistryPresent: true },
        },
        { $count: "totalCount" },
      ]);
      resolve(buildingTotal)
    });

    const values = await Promise.all([promise1, promise2]);

    if (_.isEmpty(values[0] || values[0][1])) {
      obj = {
        res,
        status: Constant.STATUS_CODE.OK,
        msg: Constant.INFO_MSGS.ITEMS_NOT_AVAILABLE,
        data: {
          buildingData: [],
          pagination: {
            offset: parseInt(offset),
            limit: parseInt(limit),
            total: 0,
          },
        },
      };
      return Response.success(obj);
    };
    obj = {
      res,
      msg: Constant.INFO_MSGS.SUCCESS,
      status: Constant.STATUS_CODE.OK,
      data: {
        buildingData: values[0],
        pagination: {
          offset: parseInt(offset),
          limit: parseInt(limit),
          total: values[1][0].totalCount,
        },
      },
    };

    return Response.success(obj);
  } catch (error) {
    console.log("error", error);
    return handleException(logger, res, error);
  }
};

const getAllregistry = async (req, res) => {
  const { logger } = req;
  try {
    let { str, page, limit, buildingId, flatNo } = req.query;
    if (_.isUndefined(str)) str = "";

    let qry = {};
    if (str) {
      qry["$or"] = [
        { BuildingName: { $regex: str, $options: "i" } },
        { Address: { $regex: str, $options: "i" } },
      ];
    }
    if (buildingId) {
      qry["$or"] = [{ buildingId: ObjectId(buildingId) }];
    }
    if (flatNo) {
      qry.flatNo = flatNo;
    }
    offset = page || 1;
    limit = limit || 20;
    const skip = limit * (offset - 1);
    const registryData = await registry.aggregate([
      {
        $match: { qry },
      },
      { $sort: { _id: -1 } },
      {
        $facet: {
          paginatedResult: [{ $skip: skip }, { $limit: parseInt(limit) }],
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
        transaction: registryData[0].paginatedResult,
        pagination: {
          offset: parseInt(offset),
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

const getAllTransaction = async (req, res) => {
  const { logger } = req;
  try {
    let {
      str,
      page,
      limit,
      minSize,
      maxSize,
      minRate,
      maxRate,
      startDate,
      endDate,
      estartDate,
      eendDate,
      locality,
      VillageName,
      state,
      city,
      buildingId,
      sellerName,
      purchaserName,
      address,
      propertyDescription,
      developer,
      buildingType,
      DocumentName,
      documentType,
      FlatNo,
      MalaNo,
      microMarket,
      selectedType,
      docFilter,
      microMarketIds,
      globalSearch,
    } = req.query;

    if (_.isUndefined(str)) str = "";

    let qry = {};
    var pinArr = [];
    const userPropertyType = req.decoded.PropertyType;
    const { userId } = req.decoded
    qry = {
      ...qry,
      archive: false,
    };
    if (globalSearch) {
      const searchFields = [
        { BuildingName: { $regex: `^${globalSearch}`, $options: "i" } },
        { DocumentNo: { $regex: `^${globalSearch}`, $options: "i" } },
        { DocumentName: { $regex: `^${globalSearch}`, $options: "i" } },
        { RegistrationDate: { $regex: `^${globalSearch}`, $options: "i" } },
        { SROName: { $regex: `^${globalSearch}`, $options: "i" } },
        { SellerName: { $regex: `^${globalSearch}`, $options: "i" } },
        { PurchaserName: { $regex: `^${globalSearch}`, $options: "i" } },
        { PurchaserEmail: { $regex: `^${globalSearch}`, $options: "i" } },
        { SellerEmail: { $regex: `^${globalSearch}`, $options: "i" } },
        { PurchaserContact: { $regex: `^${globalSearch}`, $options: "i" } },
        { SellerContact: { $regex: `^${globalSearch}`, $options: "i" } },
        { PropertyDescription: { $regex: `^${globalSearch}`, $options: "i" } },
        { SROCode: { $regex: `^${globalSearch}`, $options: "i" } },
        { Status: { $regex: `^${globalSearch}`, $options: "i" } },
        { Name: { $regex: `^${globalSearch}`, $options: "i" } },
        { Age: { $regex: `^${globalSearch}`, $options: "i" } },
        { Address: { $regex: `^${globalSearch}`, $options: "i" } },
        { PlotNo: { $regex: `^${globalSearch}`, $options: "i" } },
        { MalaNo: { $regex: `^${globalSearch}`, $options: "i" } },
        { FlatNo: { $regex: `^${globalSearch}`, $options: "i" } },
        { BlockNo: { $regex: `^${globalSearch}`, $options: "i" } },
        { PinCode: { $regex: `^${globalSearch}`, $options: "i" } },
        { Others: { $regex: `^${globalSearch}`, $options: "i" } },
        { purchaser_aadhar_no: { $regex: `^${globalSearch}`, $options: "i" } },
        { purchase_pan_no: { $regex: `^${globalSearch}`, $options: "i" } },
        { purchaser_aadhar_no: { $regex: `^${globalSearch}`, $options: "i" } },
        { purchase_pan_no: { $regex: `^${globalSearch}`, $options: "i" } },
        { AgreementNo: { $regex: `^${globalSearch}`, $options: "i" } },
        { Date: { $regex: `^${globalSearch}`, $options: "i" } },
        { Time: { $regex: `^${globalSearch}`, $options: "i" } },
        { DocumentSerialNo: { $regex: `^${globalSearch}`, $options: "i" } },
        { DocumentType: { $regex: `^${globalSearch}`, $options: "i" } },
        {
          DHCfeesOrDocumentHandlingCharges: {
            $regex: `^${globalSearch}`,
            $options: "i",
          },
        },
        { RegistrationFees: { $regex: `^${globalSearch}`, $options: "i" } },
        {
          BazarMulyaOrMarketRate: { $regex: `^${globalSearch}`, $options: "i" },
        },
        {
          MobdalaOrConsideration: { $regex: `^${globalSearch}`, $options: "i" },
        },
        {
          Bharlele_Mudrank_ShulkhOr_Stamp_Duty_Paid: {
            $regex: `^${globalSearch}`,
            $options: "i",
          },
        },
        { MTR: { $regex: `^${globalSearch}`, $options: "i" } },
        { rate: { $regex: `^${globalSearch}`, $options: "i" } },
        {
          Corporate_Identification_number_or_CIN: {
            $regex: `^${globalSearch}`,
            $options: "i",
          },
        },
        { Parking_Information: { $regex: `^${globalSearch}`, $options: "i" } },
        { License_Period: { $regex: `^${globalSearch}`, $options: "i" } },
        { Lock_In_Period: { $regex: `^${globalSearch}`, $options: "i" } },
        { Fit_our_eriod: { $regex: `^${globalSearch}`, $options: "i" } },
        {
          Escalation_in_Licensee_fees: {
            $regex: `^${globalSearch}`,
            $options: "i",
          },
        },
        {
          CAM_Or_Common_Area_Maintenance: {
            $regex: `^${globalSearch}`,
            $options: "i",
          },
        },
        { Security_Deposit: { $regex: `^${globalSearch}`, $options: "i" } },
        { city: { $regex: `^${globalSearch}`, $options: "i" } },
        { state: { $regex: `^${globalSearch}`, $options: "i" } },
        { SquareFeet: { $regex: `^${globalSearch}`, $options: "i" } },
        { totalSquareFeet: { $regex: `^${globalSearch}`, $options: "i" } },
        { SecondaryRegistrar: { $regex: `^${globalSearch}`, $options: "i" } },
        { Compensation: { $regex: `^${globalSearch}`, $options: "i" } },
        { MarketPrice: { $regex: `^${globalSearch}`, $options: "i" } },
        { SubDivisionHouseNo: { $regex: `^${globalSearch}`, $options: "i" } },
        { Area: { $regex: `^${globalSearch}`, $options: "i" } },
        { Levy: { $regex: `^${globalSearch}`, $options: "i" } },
        {
          NameAndAddressPartyOfExecutingDocument: {
            $regex: `^${globalSearch}`,
            $options: "i",
          },
        },
        {
          NameAndAddressOfDefedent: {
            $regex: `^${globalSearch}`,
            $options: "i",
          },
        },
        {
          DateOfRegistrationDeed: { $regex: `^${globalSearch}`, $options: "i" },
        },
        { expiryDate: { $regex: `^${globalSearch}`, $options: "i" } },
        { SerialNumber: { $regex: `^${globalSearch}`, $options: "i" } },
        { Shera: { $regex: `^${globalSearch}`, $options: "i" } },
        { OtherDetails: { $regex: `^${globalSearch}`, $options: "i" } },
        {
          DetailsConsideredForAssessment: {
            $regex: `^${globalSearch}`,
            $options: "i",
          },
        },
        { VillageName: { $regex: `^${globalSearch}`, $options: "i" } },
        { locality: { $regex: `^${globalSearch}`, $options: "i" } },
        { Developer: { $regex: `^${globalSearch}`, $options: "i" } },
        { parkingInformation: { $regex: `^${globalSearch}`, $options: "i" } },
        {
          authorisedRepresentativeName: {
            $regex: `^${globalSearch}`,
            $options: "i",
          },
        },
        {
          sellerLeaserContactNumber: {
            $regex: `^${globalSearch}`,
            $options: "i",
          },
        },
        {
          authorisedRepresentativePurchaserName: {
            $regex: `^${globalSearch}`,
            $options: "i",
          },
        },
        {
          purchaserLeaseeContactNumber: {
            $regex: `^${globalSearch}`,
            $options: "i",
          },
        },
        { microMarket: { $regex: `^${globalSearch}`, $options: "i" } },
        { buildingType: { $regex: `^${globalSearch}`, $options: "i" } },
        { selectedType: { $regex: `^${globalSearch}`, $options: "i" } },
        { location: { $regex: `^${globalSearch}`, $options: "i" } },
      ];
      qry["$or"] = searchFields;
    }
    if (str) {
      qry = { ...qry, BuildingName: { $regex: str, $options: "i" } };
    }
    if (docFilter) {
      qry = {
        ...qry,
        DocumentType: { $regex: docFilter, $options: "i" },
      };
    }

    if (sellerName) {
      qry = { ...qry, SellerName: { $regex: sellerName, $options: "i" } };
    }
    if (DocumentName) {
      qry = {
        ...qry,
        DocumentName: { $regex: DocumentName, $options: "i" },
      };
    }
    if (documentType) {
      qry = {
        ...qry,
        DocumentType: { $regex: documentType, $options: "i" },
      };
    }
    if (purchaserName) {
      qry = {
        ...qry,
        PurchaserName: { $regex: purchaserName, $options: "i" },
      };
    }
    if (address) {
      qry = { ...qry, Address: { $regex: address, $options: "i" } };
    }
    if (FlatNo) {
      qry = { ...qry, FlatNo: { $regex: FlatNo, $options: "i" } };
    }
    if (MalaNo) {
      qry = { ...qry, MalaNo: { $regex: MalaNo, $options: "i" } };
    }
    if (propertyDescription) {
      qry = {
        ...qry,
        PropertyDescription: {
          $regex: propertyDescription,
          $options: "i",
        },
      };
    }
    if (developer) {
      qry = { ...qry, Developer: { $regex: developer, $options: "i" } };
    }
    if (locality) {
      qry = { ...qry, locality: locality };
    }
    if (VillageName) {
      qry = {
        ...qry,
        VillageName: { $regex: VillageName, $options: "i" },
      };
    }
    if (state) {
      qry = { ...qry, state: ObjectId(state) };
    }
    if (city) {
      qry = { ...qry, city: ObjectId(city) };
    }
    if (microMarketIds) {
      const microMarketIdsArray = microMarketIds
        .split(",")
        .map((id) => ObjectId(id.trim()));
      qry = { ...qry, microMarketId: { $in: microMarketIdsArray } };
    }

    if (buildingId) {
      qry = { ...qry, buildingId: ObjectId(buildingId) };
    }
    if (buildingType) {
      qry = {
        ...qry,
        buildingType: { $regex: buildingType, $options: "i" },
      };
    }
    if (microMarket) {
      qry = { ...qry, microMarket: ObjectId(microMarket) };
    }
    // get micromarket value and search in micromarket table and Push Pincode In array
    // pinArr use for $match query and Building getBy Pincode thrw micromarket table
    // if (microMarket) {
    //   microMarket = microMarket.split(",");
    // const pinData = await microMarketModel.aggregate([
    //   { $match: { microMarketTitle: { $in: microMarket } } },
    // ]);
    // if (pinData.length > 0) {
    //   for (let i = 0; i < pinData.length; i++) {
    //     pinData[i].list.map((e) => {
    //       pinArr.push(e.pincode);
    //     });
    //   }
    // }
    // console.log("pinArr--->", pinArr);
    // qry["$or"] = [{ PinCode: { $in: pinArr } }];

    // -------  SEARCH QUERY BY MICROMARKET NAME AND MATCH ID WITH MICROMARKET IN BUILDING TABLE -----
    // const MicroData = await newMicroMarketModel.aggregate([
    //   { $match: { microMarketTitle: { $in: microMarket } } },
    // ]);
    // if (MicroData.length > 0) {
    //   for (let i = 0; i < MicroData.length; i++) {
    //     pinArr.push(MicroData[i]._id);
    //   }
    // }

    //   qry = qry
    //     ? [...qry, { microMarket: { $in: pinArr } }]
    //     : [{ microMarket: { $in: pinArr } }];
    // }

    if (startDate && endDate) {
      startDate = new Date(startDate);
      endDate = new Date(endDate);
      endDate.setDate(endDate.getDate() + 1);
      qry = {
        ...qry,
        DateOfRegistrationDeed: { $gt: startDate },
        DateOfRegistrationDeed: { $lt: endDate },
      };
    }
    if (estartDate && eendDate) {
      estartDate = new Date(estartDate);
      eendDate = new Date(eendDate);
      eendDate.setDate(eendDate.getDate() + 1);
      qry = {
        ...qry,
        expiryDate: { $gte: estartDate, $lte: eendDate },
      };
    }
    if (minSize && maxSize) {
      qry["SquareFeet"] = {
        $gte: parseInt(minSize),
        $lte: parseInt(maxSize),
      };
    }

    if (minRate && maxRate) {
      if(documentType == "Rent"){
        qry["rent_rate"] = {
          $gte: parseInt(minRate),
          $lte: parseInt(maxRate),
        };
      };

      if(documentType == "Sale" ){
        qry["sale_rate"] = {
          $gte: parseInt(minRate),
          $lte: parseInt(maxRate),
        };
      }
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


    const aggregationPipeline1 = [
      {
        $match: qry,
      },
      { $sort: { updatedAt: -1 } },
      { $skip: skip},
      { $limit: limit},
      {
        $lookup: {
          from: "buildings",
          localField: "buildingId",
          foreignField: "_id",
          as: "buildingData",
        },
      },
      {
        $lookup: {
          from: "registryviews",
          localField: "_id",
          foreignField: "registryId",
          as: "registryInfo",
        },
      },
      {
        $unwind: {
          path: "$buildingData",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          DocumentNo: 1,
          DocumentName: 1,
          RegistrationDate: 1,
          SROName: 1,
          SellerName: 1,
          SellerEmail:1,
          PurchaserName: 1,
          PurchaserEmail:1,
          sellerLeaserContactNumber:1,
          purchaserLeaseeContactNumber:1,
          PropertyDescription: 1,
          SROCode: 1,
          Status: 1,
          Address: 1,
          BuildingName: 1,
          MalaNo: 1,
          FlatNo: 1,
          BlockNo: 1,
          PinCode: 1,
          CAM_Or_Common_Area_Maintenance:1,
          parking_info_two_wheeler: 1,
          parking_info_four_wheeler: 1,
          Escalation_in_Licensee_fees:1,
          Lock_In_Period: 1,
          Security_Deposit: 1,
          DocumentType: 1,
          buildingType: 1,
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
          user : userId,                  
          // buildingId: "$buildingData",
          microMarketId: 1,
          locality:1,
          Compensation: 1,
          createdAt: 1,
          SquareFeet: 1,
          rate: 1,
          city: 1,
          state: 1,
          expiryDate: 1,
          MarketPrice: 1,
          unit_status:1,
          sale_value:1,
          powerBackup:1,
          right_of_refusal_active:1,
          right_of_refusal_floors:1,
          rent_purchaser_fees:1,
          rent_rate:1,
          sale_rate:1,
          auth_rep_seller_name:1,
          auth_rep_purchaser_name:1,
          unit_condition:1,

          // __v:0
        },
      },
    ];

    const promise1 = new Promise((resolve, reject) => {
      
      const registryData =  registry.aggregate(aggregationPipeline1, {
        allowDiskUse: true,
      });
      resolve(registryData)
    });

    const promise2 = new Promise((resolve, reject) => {
     
      const registryTotal =  registry.aggregate([
        {
          $match: qry,
        },
        { $count: "totalCount" },
      ]);
      resolve(registryTotal)
    });

    const values = await Promise.all([promise1, promise2]);

    if (_.isEmpty(values[0] || values[0][1])) {
      obj = {
        res,
        status: Constant.STATUS_CODE.OK,
        msg: Constant.INFO_MSGS.ITEMS_NOT_AVAILABLE,
        data: {
          transaction: [],
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
        transaction: values[0],
        pagination: {
          offset: parseInt(offset),
          limit: parseInt(limit),
          total: values && values[1] && values[1][0] ? values[1][0].totalCount : 0,
        },
      },
    };

    return Response.success(obj);
  } catch (error) {
    console.log("error", error);
    return handleException(logger, res, error);
  }
};

const getByIdTransaction = async (req, res) => {
  const { logger } = req;
  try {
    const _id = req.params._id;
    const registryData = await registry.aggregate([
      {
        $match: { _id: ObjectId(_id) },
      },
      {
        $lookup: {
          from: "newmicromarkets",
          localField: "microMarket",
          foreignField: "_id",
          as: "micromarketData",
        },
      },
      {
        $lookup: {
          from: "buildings",
          localField: "buildingId",
          foreignField: "_id",
          as: "buildingData",
        },
      },
      {
        $project: {
          _id: 1,
          DocumentNo: 1,
          DocumentName: 1,
          RegistrationDate: 1,
          SROName: 1,
          SellerName: 1,
          PurchaserName: 1,
          auth_rep_seller_name:1,
          auth_rep_purchaser_name:1,
          auth_rep_purchaser_role:1,
          auth_rep_seller_role:1,
          PurchaserEmail: 1,
          SellerEmail: 1,
          PurchaserContact: 1,
          SellerContact: 1,
          PropertyDescription: 1,
          SROCode: 1,
          Status: 1,
          Name: 1,
          Age: 1,
          Address: 1,
          PlotNo: 1,
          MalaNo: 1,
          FlatNo: 1,
          BuildingName: 1,
          BlockNo: 1,
          PinCode: 1,
          Others: 1,
          purchaser_aadhar_no: 1,
          purchase_pan_no: 1,
          purchaser_aadhar_no: 1,
          purchase_pan_no: 1,
          AgreementNo: 1,
          Date: 1,
          Time: 1,
          DocumentSerialNo: 1,
          DocumentType: 1,
          DHCfeesOrDocumentHandlingCharges: 1,
          RegistrationFees: 1,
          BazarMulyaOrMarketRate: 1,
          MobdalaOrConsideration: 1,
          Bharlele_Mudrank_ShulkhOr_Stamp_Duty_Paid: 1,
          MTR: 1,
          rate: 1,
          Corporate_Identification_number_or_CIN: 1,
          Parking_Information: 1,
          License_Period: 1,
          Lock_In_Period: 1,
          Fit_our_eriod: 1,
          Escalation_in_Licensee_fees: 1,
          rent_purchaser_fees:1,
          sale_value: 1,
          rent_rate: 1,
          sale_rate: 1,          
          CAM_Or_Common_Area_Maintenance: 1,
          Security_Deposit: 1,
          city: 1,
          state: 1,
          SquareFeet: 1,
          totalSquareFeet: 1,
          buildingId: 1,
          SecondaryRegistrar: 1,
          Compensation: 1,
          MarketPrice: 1,
          SubDivisionHouseNo: 1,
          Area: 1,
          Levy: 1,
          notice_date:1,
          sellerLeaserContactNumber:1,
          purchaserLeaseeContactNumber:1,
          PurchaserEmail:1,
          SellerEmail:1,
          NameAndAddressPartyOfExecutingDocument: 1,
          NameAndAddressOfDefedent: 1,
          DocumentSubmissionDate: 1,
          DateOfRegistrationDeed: 1,
          expiryDate: 1,
          SerialNumber: 1,
          Shera: 1,
          OtherDetails: 1,
          DetailsConsideredForAssessment: 1,
          VillageName: 1,
          locality: 1,
          Developer: 1,
          parking_info_two_wheeler: 1,
          parking_info_four_wheeler: 1,
          is_active: 1,
          microMarket: 1,
          location: 1,
          createdAt: 1,
          updatedAt: 1,
          lat: 1,
          long: 1,
          file: 1,
          right_of_refusal_active:1,
          right_of_refusal_floors:1,
          cityTitle: { $arrayElemAt: ["$micromarketData.cityTitle", 0] },
          stateTitle: { $arrayElemAt: ["$micromarketData.stateTitle", 0] },
          microMarketTitle: {
            $arrayElemAt: ["$micromarketData.microMarketTitle", 0],
          },
          unit_status:1,
          unit_condition:1,
          buildingStatus: { $arrayElemAt: ["$buildingData.buildingStatus", 0] },
        },
      },
    ]);
    if (_.isEmpty(registryData)) {
      obj = {
        res,
        status: Constant.STATUS_CODE.OK,
        msg: Constant.INFO_MSGS.ITEMS_NOT_AVAILABLE,
        data: null,
      };
      return Response.success(obj);
    }
    obj = {
      res,
      msg: Constant.INFO_MSGS.SUCCESS,
      status: Constant.STATUS_CODE.OK,
      data: {
        registryData,
      },
    };

    return Response.success(obj);
  } catch (error) {
    console.log("error", error);
    return handleException(logger, res, error);
  }
};

const getAllMala = async (req, res) => {
  const { logger } = req;
  try {
    let { buildingId } = req.params;
    const registryData = await registry.aggregate([
      {
        $match: { buildingId: ObjectId(buildingId) },
      },
      {
        $group: {
          _id: "$MalaNo",
        },
      },
      {
        $project: {
          MalaNo: "$_id",
          PurchaserName: "$PName",
          FlatNo: "$FlatNo",
        },
      },
    ]);
    obj = {
      res,
      msg: Constant.INFO_MSGS.SUCCESS,
      status: Constant.STATUS_CODE.OK,
      data: {
        floor: registryData,
      },
    };

    return Response.success(obj);
  } catch (error) {
    console.log("error", error);
    return handleException(logger, res, error);
  }
};

const getAllFlat = async (req, res) => {
  const { logger } = req;
  try {
    let { buildingId, MalaNo } = req.params;
    const registryData = await registry.aggregate([
      {
        $match: {
          buildingId: ObjectId(buildingId),
          MalaNo: parseInt(MalaNo),
        },
      },
      {
        $group: {
          _id: "$FlatNo",
          PName: {
            $first: "$PurchaserName",
          },
          FlatNo: {
            $first: "$FlatNo",
          },
          tranId: {
            $first: "$_id",
          },
        },
      },
      {
        $project: {
          MalaNo: "$_id",
          PurchaserName: "$PName",
          FlatNo: "$FlatNo",
          registryId: "$tranId",
        },
      },
    ]);
    obj = {
      res,
      msg: Constant.INFO_MSGS.SUCCESS,
      status: Constant.STATUS_CODE.OK,
      data: {
        flat: registryData,
      },
    };

    return Response.success(obj);
  } catch (error) {
    console.log("error", error);
    return handleException(logger, res, error);
  }
};

const downloadIndex2 = async (req, res) => {
  let { state, city, locality, year, documentNo } = req.query;

  const fileKey = `Index2/${state}/${city}/${locality}/${year}/${documentNo}.pdf`;

  const params = {
    Bucket: bucketName,
    Key: fileKey,
  };

  s3.getObject(params, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error downloading PDF");
    }

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${documentNo}`);

    // Pipe the S3 object data to the response
    data.Body.pipe(res);
  });
};
// const getAllDuplicateBuilding = async(req, res) =>{
//   const buildData = await building.find();
//   // console.log(buildData)
//   let duplicateBuilding = [];
//   for(let i=0; i< buildData.length; i++){
//     // console.log("In for loop", buildData[i].BuildingName);
//     let buildId = buildData[i]._id;
//     let buildName = buildData[i].BuildingName;
//     let buildMicroMarket = buildData[i].microMarket;
//     let buildLocality = buildData[i].locality;
//     let buildCity = buildData[i].city;
//     let buildState = buildData[i].state;
//     let buildAddress = buildData[i].Address;

//     const query = {
//       BuildingName : buildName,
//       microMarket  : buildMicroMarket,
//       locality     : buildLocality,
//       city         : buildCity,
//       state        : buildState,
//       // Address      : buildAddress,
//       _id          : {$ne :buildId}
//     }
//     // console.log('Find Query',query)
//     console.log([i])
//     let duplicateBuild;
//     let delNaBuild;
//     if( buildName === "NA" ){
//       query.Address =  buildAddress
//       // console.log("Address Query",query)
//        duplicateBuild = await building.findOne(query);
//        if(duplicateBuild){
//         console.log("NA Duplicate Building", duplicateBuild._id, );
//          delNaBuild = await building.deleteOne({_id: duplicateBuild._id})
//         console.log(delNaBuild)
//        }
//     }  else{
//        duplicateBuild = await building.findOne(query);
//        if(duplicateBuild){
//        console.log("Non NA Duplicate Building", duplicateBuild._id, );
//         delNaBuild = await building.deleteOne({_id: duplicateBuild._id})
//        }
//     }

//     if(duplicateBuild){
//     duplicateBuilding.push(duplicateBuild._id);

//     // console.log(duplicateBuild._id)
//     let updateTransaction = await registry.updateMany({buildingId: duplicateBuild._id},  { $set: { buildingId: buildId } })
//     // console.log(updateTransaction)
//     // delNaBuild = await building.deleteOne({_id: duplicateBuild._id});

//     const duplicates = [];
//     const seen = {};

//     let buildingTra = await registry.find({ buildingId: buildId });
// console.log(buildingTra)
//     buildingTra.forEach((obj) => {
//       console.log(obj._id)
//       let objectString = JSON.stringify(obj);

//     if (seen[objectString]) {
//       if (!duplicates.some((duplicate) => JSON.stringify(duplicate) === objectString)) {
//         duplicates.push(traId);
//       }
//     } else {
//       seen[objectString] = true;
//     }
//   })

//     for(let j=0; j<buildingTra.length; j++){
//       let buildId = buildingTra[j].buildingId;
//       let docNo = buildingTra[j].DocumentNo;
//       let docName = buildingTra[j].DocumentName;
//       let buildName = buildingTra[j].BuildingName;
//       let cityId = buildingTra[j].city;
//       let stateId = buildingTra[j].state;
//       let microId = buildingTra[j].microMarket;
//       let localityName = buildingTra[j].locality;
//       let traId = buildingTra[j]._id;
//       console.log(traId);

//       let traQuery = {
//       buildingId: buildId ,
//       DocumentNo: docNo,
//       DocumentName: docName ,
//       BuildingName: buildName ,
//       city: cityId ,
//       state: stateId ,
//       microMarket: microId ,
//       locality: localityName,
//       // _id :  {$ne :traId}
//       }

//       // console.log("Tra Query",traQuery)

//       // let findDupTra = await registry.deleteMany(traQuery);

//       // if(findDupTra){
//       //   // console.log("Find Duplicate", findDupTra)

//       //     for(let k=0; k<findDupTra.length; k++){
//       //       let traId = findDupTra[k];
//       //       if(traId){
//       //       console.log("Duplicate Tra Id",traId._id);
//       //       }
//       //       let deleteQuery = {
//       //         _id: traId
//       //       }

//       //       // console.log("Delete Query",deleteQuery)
//       //       // let delDupTra = await registry.deleteMany(deleteQuery);
//       //       // console.log("Delete Duplicate Tra", delDupTra);

//       //   // console.log("Duplicate Trasaction2",duplicateTra[k]._id, [k])
//       // }
//       // }

//       // console.log("Building Trasaction",buildingTra[j].buildingId)

//     }

//     console.log("Duplicate Trasaction", duplicates, seen);

//     console.log("Duplicate Building Name",duplicateBuild._id)
//     }
//   }
//   // console.log("Duplicate Building Array", buildData.length, duplicateBuilding);
//   return res.send(duplicateBuilding);
// }

module.exports = {
  // getAllDuplicateBuilding,
  getAllBuilding,
  getBuildingById,
  getAllregistry,
  getAllTransaction,
  getByIdTransaction,
  getAllMala,
  getAllFlat,
  downloadIndex2,
  buildingAutoComplete
};
