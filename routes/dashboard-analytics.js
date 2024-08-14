const express = require('express');
const router = express.Router();
const View = require('../controller/dashboard-graphs/top-ten');
const Trending = require("../controller/dashboard-graphs/trend");
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get("/dashboard/graph/top-ten/absorption", View.findTopTenAbsorption);
router.get("/dashboard/graph/top-ten/supply", View.findTopTenSupply);
router.get("/dashboard/graph/top-ten/demand", View.findTopTenDemand);


router.get("/dashboard/graph/trending/localities", Trending.findTrendingLocalities);
router.get("/dashboard/graph/localities/price", Trending.findLocalitiesByPrice);
module.exports = router;