const { handleException } = require('../../helpers/exception');
const Response = require('../../helpers/response');
const Constant = require('../../helpers/constant');
const buildingFilter = require("../../models/buildingFilter");
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;


const addFilter = async (req, res) => {
    const { logger } = req;

    try {
        const { userId } = req.decoded;
        const { searchName, MinRental, MaxRental, FloorMinSize, FloorMaxSize, status } = req.body
        const saveFilter = await buildingFilter.create({
            userId,
            searchName,
            MinRental,
            MaxRental,
            FloorMinSize,
            FloorMaxSize,
            status
        });
        if (!saveFilter) {
            const obj = {
                res,
                status: Constant.STATUS_CODE.BAD_REQUEST,
                msg: Constant.ERROR_MSGS.CREATE_ERR,
            };
            return Response.error(obj);
        } else {
            const obj = {
                res,
                msg: Constant.INFO_MSGS.CREATED_SUCCESSFULLY,
                status: Constant.STATUS_CODE.OK,
                data: saveFilter,
            };
            return Response.success(obj);
        }
    } catch (error) {
        console.log('error', error)
        return handleException(logger, res, error);
    }
};

const updateFilter = async (req, res) => {
    const { logger } = req;

    try {
        const _id = req.params.id
        let updateFilter = await buildingFilter.findByIdAndUpdate({ _id }, req.body, { new: true });
        if (!updateFilter) {
            const obj = {
                res,
                status: Constant.STATUS_CODE.BAD_REQUEST,
                msg: Constant.INFO_MSGS.NO_DATA,
            };
            return Response.error(obj);
        } else {
            const obj = {
                res,
                msg: Constant.INFO_MSGS.UPDATED_SUCCESSFULLY,
                status: Constant.STATUS_CODE.OK,
                data: updateFilter,
            };
            return Response.success(obj);
        }
    } catch (error) {
        console.log('error', error)
        return handleException(logger, res, error);
    }

};

const deleteFilter = async (req, res) => {
    const { logger } = req;

    try {
        const _id = req.params.id
        let deleteFilter = await buildingFilter.findByIdAndDelete({ _id });
        if (!deleteFilter) {
            const obj = {
                res,
                status: Constant.STATUS_CODE.BAD_REQUEST,
                msg: Constant.INFO_MSGS.NO_DATA,
            };
            return Response.error(obj);
        } else {
            const obj = {
                res,
                msg: Constant.INFO_MSGS.DELETED_SUCCESSFULLY,
                status: Constant.STATUS_CODE.OK,
                data: deleteFilter,
            };
            return Response.success(obj);
        }
    } catch (error) {
        console.log('error', error)
        return handleException(logger, res, error);
    }
}

const getFilterById = async (req, res) => {
    const { logger } = req;
    try {
        // const userId = req.params.id
        const { userId } = req.decoded;
        const filterData = await buildingFilter.aggregate([
            {
                $match: { userId: mongoose.Types.ObjectId(userId) },
            },
            {
                $project: {
                    __v: 0
                },
            },
        ]);
        if (!filterData) {
            const obj = {
                res,
                status: Constant.STATUS_CODE.BAD_REQUEST,
                msg: Constant.ERROR_MSGS.USER_NOT_FOUND,
            };
            return Response.error(obj);
        } else {
            const obj = {
                res,
                msg: Constant.INFO_MSGS.SUCCESS,
                status: Constant.STATUS_CODE.OK,
                data: filterData,
            };
            return Response.success(obj);
        }
    } catch (error) {
        console.log('error', error)
        return handleException(logger, res, error);
    }
};


module.exports = {
    addFilter,
    updateFilter,
    deleteFilter,
    getFilterById,
}






