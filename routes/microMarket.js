const express = require("express");
const router = express.Router();
const microMarket = require("../controller/microMarket/microMarket");
const { auth } = require("../middlewares/auth");

router.use(auth);

router.get("/getAll-micromarket", microMarket.getAllMicroMarket);
router.get("/get-micromarket", microMarket.getMicroMarketByStateAndCity);
router.get("/microMarketData",microMarket.getAllMicroMarketData)

module.exports = router;
