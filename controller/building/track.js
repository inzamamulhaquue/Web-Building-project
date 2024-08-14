const _ = require('underscore');
const track = require('../../models/track');
const { handleException } = require('../../helpers/exception');
const Response = require('../../helpers/response');
const buildings = require("../../models/building");
const Constant = require('../../helpers/constant');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

/**
 * building Track
 */
const buildingTrack = async (req, res) => {
    const { logger } = req;
    try {
        const { buildingId } = req.body;
        const { userId } = req.decoded;
        const viewData = await track.find({ userId });
        if (viewData == "") {
            await track.create({ userId });
        }
        const exists = await track.exists({ userId, 'building': buildingId });
        if (!exists) {
            await track.findOneAndUpdate(
                { userId },
                {
                    $push: {
                        building: buildingId
                    },
                },
            );
        }
        const obj = {
            res,
            status: Constant.STATUS_CODE.OK,
            msg: exists
                ? Constant.INFO_MSGS.ALREADY_TRACK
                : Constant.INFO_MSGS.TRACK_ADDED,
        };
        return Response.success(obj);
    } catch (error) {
        return handleException(logger, res, error);
    }
};




const getTrackList = async (req, res) => {
    const { logger } = req;
    try {

        let { sortBy, str, page, limit } = req.query;
        if (_.isUndefined(str)) str = '';
        if (sortBy === 'recent') {
            sortBy = { createdAt: -1 };
        } else {
            sortBy = { createdAt: 1 };
        }
        const { userId } = req.decoded;
        const { building } = await track.findOne({ userId }, { _id: 0, building: 1 }).lean(true);

        let qry = {};
        if (str) {
            qry['$or'] = [
                { "BuildingName": { $regex: str, $options: 'i' } },
                { "Address": { $regex: str, $options: 'i' } },
            ]
        }
        offset = page || 1;
        limit = limit || 20;
        const skip = limit * (offset - 1);
        const buildingData = await buildings.aggregate([
            {
                // $match: {
                //     qry,
                // },
                $match: {
                    _id: {
                        $in: building
                    },
                },
            },
            { $sort: sortBy },
            {
                $facet: {
                    paginatedResult: [{ $skip: skip }, { $limit: parseInt(limit) }],
                    totalCount: [{ $count: 'count' }],
                },
            },
        ])
        if (_.isEmpty(buildingData[0].paginatedResult)) {
            obj = {
                res,
                status: Constant.STATUS_CODE.OK,
                msg: Constant.INFO_MSGS.ITEMS_NOT_AVAILABLE,
                data: {
                    items: [],
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
                transaction: buildingData[0].paginatedResult,
                pagination: {
                    offset: parseInt(offset),
                    limit: parseInt(limit),
                    total: buildingData[0].totalCount[0].count,
                },
            },
        };

        return Response.success(obj);
    } catch (error) {
        console.log('error', error)
        return handleException(logger, res, error);
    }
};



/**
 * building Track pull
 */
const deleteBuildingTrack = async (req, res) => {
    const { logger } = req;
    try {
        const { buildingId } = req.body;
        const { userId } = req.decoded;
        const viewData = await track.find({ userId });
        if (viewData == "") {
            await track.create({ userId });
        }
        const exists = await track.exists({ userId, 'building': buildingId });
        if (exists) {
            await track.findOneAndUpdate(
                { userId },
                {
                    $pull: {
                        building: buildingId
                    },
                },
            );
        }
        const obj = {
            res,
            status: Constant.STATUS_CODE.OK,
            msg: exists
                ? Constant.INFO_MSGS.REMOVE_TRACK
                : Constant.INFO_MSGS.TRACK_ADDED,
        };
        return Response.success(obj);
    } catch (error) {
        return handleException(logger, res, error);
    }
};


module.exports = { buildingTrack, getTrackList, deleteBuildingTrack };
