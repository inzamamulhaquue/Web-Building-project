const express = require("express");

const router = express.Router();
const user = require("./user");
const building = require("./building");
const dashboard = require("./dashboard");
const analytics = require("./analytics");
const map = require("./map");
const microMarket = require("./microMarket");
const stateCity = require("./stateCity");
const enquiry = require("./enquiry");
const dashboardAnalytics = require("./dashboard-analytics");
const contactUs = require("./contactUs");
const feedBack = require("./feedBack");
const career = require("./career");
const requirment = require("./requirement");
const agreement = require("./agreement");
const index2 = require("./index2")
const landing = require("./landingApi");
// const script = require("./script")

router.use("/", contactUs);
router.use("/", feedBack);
router.use("/", career);
router.use("/", stateCity);
router.use("/", user);
router.use("/", building);
router.use("/", dashboard);
router.use("/", analytics);
router.use("/", map);
router.use("/", microMarket);
router.use("/", enquiry);
router.use("/", dashboardAnalytics);
router.use("/", requirment);
router.use("/", agreement);
router.use("/", index2);
router.use("/", landing);
// router.use("/",script)

module.exports = router;
