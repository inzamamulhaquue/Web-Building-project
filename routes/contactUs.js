const { Router } = require('express');
const contactUsRoute = Router();
const contactUsController = require("../controller/contactUs/contactUsController");

contactUsRoute.post("/contectus-add", contactUsController.addContactUs)

module.exports = contactUsRoute;