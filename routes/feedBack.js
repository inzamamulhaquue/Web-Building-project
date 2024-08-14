const { Router } = require('express');
const feedBackRoute = Router();
const feedBackController = require("../controller/feedBack/feedBackController");
const { upload } = require("../middlewares/s3-upload");


feedBackRoute.post("/feedBack-add",upload.array('images', 10), feedBackController.addFeedBack)

module.exports = feedBackRoute;