const { Router } = require('express');
const RequirementRoute = Router();
const Requirement = require("../controller/enquiry/requirement");

RequirementRoute.post("/addRequirement", Requirement.addRequirement)

module.exports = RequirementRoute;