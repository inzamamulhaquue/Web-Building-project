const { Router } = require('express');
const careerRoute = Router();
const careerController = require("../controller/career/careerController");

const { upload } = require("../middlewares/s3-upload");

careerRoute.post("/career-add",upload.array('images', 10), careerController.addCareer);

module.exports = careerRoute;