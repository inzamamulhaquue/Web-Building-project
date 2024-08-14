const _ = require("underscore");
const buildingView = require("../../models/buildingView");
const registryView = require("../../models/registryView");
const { handleException } = require("../../helpers/exception");
const building = require("../../models/building");
const registry = require("../../models/registry");
const dashboard = require("../../models/dashboard");
const Response = require("../../helpers/response");
const Constant = require("../../helpers/constant");
const User = require("../../models/user");
const wallet = require("../../models/wallet");
const city = require("../../models/city");
const track = require('../../models/track');
const { ObjectId } = require("mongoose").Types;
const mongoose = require("mongoose");
/**
 * building views
 */
const buildingViews = async (req, res) => {
  const { logger } = req;
  try {
    const { buildingId } = req.body;
    const { userId } = req.decoded;
    const { clientIp } = req;

    const buildingData = await building.findOne({ _id: ObjectId(buildingId) });

    let debitAmount = 1;
    let remark = buildingData.BuildingName;
    const userData1 = await User.findById({ _id: userId });
    if (userData1.walletAmount < debitAmount) {
      const obj = {
        res,
        status: Constant.STATUS_CODE.BAD_REQUEST,
        msg: Constant.ERROR_MSGS.NOT_HAVE_A_SUFFICIENT_WALLET_AMOUNT,
      };
      return Response.error(obj);
    }

    const viewData = await buildingView.find({ buildingId });

    if (viewData == "") {
      await buildingView.create({ buildingId });
    }
    const exists = await buildingView.exists({
      buildingId,
      "user_list.userId": userId,
      "ip_list.ip": clientIp,
    });
    if (!exists) {
      if (userData1.walletAmount > debitAmount) {
        await debit(logger, debitAmount, remark, userId);
      }
      await buildingView.findOneAndUpdate(
        { buildingId },
        {
          $push: {
            ip_list: {
              ip: clientIp,
            },
            user_list: {
              userId: userId,
            },
          },
          $inc: {
            numberOfViews: 1,
          },
        }
      );
    }
    const obj = {
      res,
      status: Constant.STATUS_CODE.OK,
      msg: exists
        ? Constant.INFO_MSGS.ALREADY_VIEWED
        : Constant.INFO_MSGS.VIEW_ADDED,
    };
    return Response.success(obj);
  } catch (error) {
    console.log("error afsd", error);
    return handleException(logger, res, error);
  }
};

/**
 * Registry views
 */
const registryViews = async (req, res) => {
  const { logger } = req;
  try {
    const { registryId } = req.body;
    const { userId } = req.decoded;
    const { clientIp } = req;

    const registryData = await registry.findOne({ _id: ObjectId(registryId) });

    let debitAmount = 1;
    let remark = registryData.BuildingName;
    const userData1 = await User.findById({ _id: userId });
    if (userData1.walletAmount < debitAmount) {
      const obj = {
        res,
        status: Constant.STATUS_CODE.BAD_REQUEST,
        msg: Constant.ERROR_MSGS.NOT_HAVE_A_SUFFICIENT_WALLET_AMOUNT,
      };
      return Response.error(obj);
    }

    const viewData = await registryView.find({ registryId });

    if (viewData == "") {
      await registryView.create({ registryId });
    }
    const exists = await registryView.exists({
      registryId,
      "user_list.userId": userId,
      "ip_list.ip": clientIp,
    });
    if (!exists) {
      await debit(logger, debitAmount, remark, userId);
      await registryView.findOneAndUpdate(
        { registryId },
        {
          $push: {
            ip_list: {
              ip: clientIp,
            },
            user_list: {
              userId: userId,
            },
          },
          $inc: {
            numberOfViews: 1,
          },
        }
      );
    }
    const obj = {
      res,
      status: Constant.STATUS_CODE.OK,
      msg: exists
        ? Constant.INFO_MSGS.ALREADY_VIEWED_REGISTRY
        : Constant.INFO_MSGS.VIEW_ADDED,
    };
    return Response.success(obj);
  } catch (error) {
    console.log("error: ", error);
    return handleException(logger, res, error);
  }
};

/**
 * building views
 */
const viewDashboard = async (req, res) => {
  const { logger } = req;
  try {
    const { cityId, selectedType } = req.query;
    const userPropertyType = req.decoded.PropertyType;
    const { userId } = req.decoded;
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

    const promise1 = new Promise((resolve, reject) => {
      const buildings =  building.aggregate([
        { $match: { city: ObjectId(cityId), isRegistryPresent : true, ...qry } },
        // {
        //   $lookup: {
        //     from: "registries",
        //     localField: "_id",
        //     foreignField: "buildingId",
        //     // pipeline: [{ $match: { archive: false } }],
        //     as: "registriesData",
        //   },
        // },
        // {
        //   $match: {
        //     // Filter out documents where registriesData is an empty array
        //     registriesData: { $ne: [] },
        //   },
        // },
        { $count: "totalCount" }
      ]);
      resolve(buildings)
    })
    const promise2 = new Promise((resolve, reject) => {
      const registries =  registry.aggregate([
        { $match: { city: ObjectId(cityId), ...qry } },
        { $count: "totalCount" }
      ]);
      resolve(registries)
    })
    // const promise3 = new Promise((resolve, reject) => {
    //   const totalSquare =  building.aggregate([
    //     { $match: { city: ObjectId(cityId), ...qry } },
    //     { $group: { _id: null, total: { $sum: "$totalSquareFeet" } } },
    //   ]);
    //   resolve(totalSquare)
    // })

    const promise3 = new Promise((resolve, reject) => {
      const totalSquare =  registry.aggregate([
        { $match: { city: ObjectId(cityId), ...qry } },
        { $group: { _id: null, total: { $sum: "$SquareFeet" } } },
      ]);
      resolve(totalSquare)
    })
    const promise4 = new Promise((resolve, reject) => {
      const totalRegistry =  registry.aggregate([
        { $match: { city: ObjectId(cityId), ...qry } },
        { $group: { _id: null, total: { $sum: "$MarketPrice" } } },
      ]);
      resolve(totalRegistry)
    })
    const promise5 = new Promise((resolve, reject) => {
      const totalTrack =  track.findOne({ userId });
      resolve(totalTrack)
    })

    const values = await Promise.all([promise1, promise2, promise3, promise4, promise5]);
    
    const obj = {
      res,
      status: Constant.STATUS_CODE.OK,
      msg: Constant.INFO_MSGS.SUCCESS,
      data: {
        building: values[0] ? values[0][0].totalCount : 0,
        registry:  values[1] ? values[1][0].totalCount : 0,
        totalSquareFeet: values[2] ? values[2][0].total : 0,
        totalRegistryAmount: values[3] ? parseFloat(values[3][0].total.toFixed(2)) : 0,
        totalTrack: values[4] ? values[4].building.length : 0
      },
    };

    return Response.success(obj);
  } catch (error) {
    console.log("error", error);
    return handleException(logger, res, error);
  }
};

const updateDashboardData = async () => {
  // await building.updateMany({ BuildingName: { $ne: null } } ,{state:ObjectId('643fbfb5be2841ef807208ea'), city:ObjectId('643fbbdd2954e6cdb2aabeb0')});
  // await registry.updateMany({ BuildingName: { $ne: null } } ,{state:ObjectId('643fbfb5be2841ef807208ea'), city:ObjectId('643fbbdd2954e6cdb2aabeb0')});
  let getCityData = await city.find();
  for (let citydata of getCityData) {
    const buildings = await building.find({ city: citydata._id });
    const registrys = await registry.find({ city: citydata._id });
    const totalSquare = await building.aggregate([
      { $match: { city: citydata._id } },
      { $group: { _id: null, total: { $sum: "$totalSquareFeet" } } },
    ]);
    const totalRegistry = await registry.aggregate([
      { $match: { city: citydata._id } },
      { $group: { _id: null, total: { $sum: "$Security_Deposit" } } },
    ]);
    let bycityDashboard = await dashboard.find({ cityId: citydata._id });
    if (bycityDashboard) {
      let dashboardDatas = await dashboard.findOneAndUpdate(
        { cityId: citydata._id },
        {
          data: {
            buildings: buildings.length | 0,
            transactions: registrys.length | 0,
            totalRegistryAmount: totalSquare[0] ? totalSquare[0].total : 0,
            totalSquareFeet: totalRegistry[0] ? totalRegistry[0].total : 0,
          },
        }
      );
    } else {
      let dashboardDatas = await dashboard.create({
        cityId: citydata._id,
        data: {
          buildings: buildings.length | 0,
          transactions: registrys.length | 0,
          totalRegistryAmount: totalSquare[0] ? totalSquare[0].total : 0,
          totalSquareFeet: totalRegistry[0] ? totalRegistry[0].total : 0,
        },
      });
    }
  }
};

const debit = (logger, debitAmount, remark, userId) =>
  new Promise(async (resolve, reject) => {
    try {
      const curruntTime = new Date();
      const timeCode = curruntTime.getTime();
      const saveData = await wallet.create({
        userId,
        debitAmount,
        remark,
        transactionNo: timeCode,
      });

      if (!saveData) {
        const obj = {
          res,
          status: Constant.STATUS_CODE.BAD_REQUEST,
          msg: Constant.ERROR_MSGS.CREATE_ERR,
        };
        return Response.error(obj);
      } else {
        const userData1 = await User.findById({ _id: userId });
            if (!userData1) {
          const obj = {
            res,
            status: Constant.STATUS_CODE.BAD_REQUEST,
            msg: Constant.ERROR_MSGS.INVALID_ID,
          };
          return Response.error(obj);
        }
        const mainWalletAmount = userData1.walletAmount;
        const debitData = userData1.walletAmount - debitAmount;
        if (mainWalletAmount === 0 || debitData < 0) {
          const obj = {
            res,
            status: Constant.STATUS_CODE.BAD_REQUEST,
            msg: Constant.ERROR_MSGS.WALLET_DEBIT_ERR,
          };
          return Response.error(obj);
        }
        const updateUser = await User.findByIdAndUpdate(
          { _id: userId },
          { walletAmount: debitData },
          { new: true }
        );
        if (!updateUser) {
          const obj = {
            res,
            status: Constant.STATUS_CODE.BAD_REQUEST,
            msg: Constant.ERROR_MSGS.UPDATE_ERR,
          };
          return Response.error(obj);
        } else {
          const userData = await User.findById({ _id: userId });
          const userWallet = await wallet.findByIdAndUpdate(
            { _id: saveData._id },
            { availableAmount: userData.walletAmount },
            { new: true }
          );
					resolve(userWallet);
				}
			}
		} catch (error) {
			console.log("common Debit Log :", error);
			reject(error);
		}
	});
module.exports = { buildingViews, viewDashboard, registryViews, debit };
