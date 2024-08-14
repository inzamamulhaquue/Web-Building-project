const { Router } = require("express");
const index2Route = Router();
const index2 = require("../controller/building/index2Controller");

index2Route.get("/getIndex2/:registryId", index2.getIndex2ById);

module.exports = index2Route;