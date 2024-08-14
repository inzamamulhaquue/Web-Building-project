const express = require("express");
const router = express.Router();
const state = require("../controller/building/stateController");
const city = require("../controller/building/cityController");
const locality = require("../controller/building/localityController");

// stateRoute ---------
router.get("/getAll-state", state.getAllState);

// City-Route ---------
router.get("/getAll-city", city.getCityByStateId);
router.get("/get-locality-by-cityid/:cityid", locality.getlocalityByCityId);


module.exports = router;
