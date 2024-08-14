const express = require('express');
const router = express.Router();
const analytics = require('../controller/analytics/analytics');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get("/get-square-feet/:id", analytics.getSquareFeet)
router.get("/get-current-registry", analytics.getCurrunt50registry)
// router.get("/get-top-locality", analytics.getTop10Locality)
router.get("/get-registry-number", analytics.findQuarterlyAndYearlyRegistries);
router.get("/get-registry-by-micromarket", analytics.getSquareFeetByMicroMarket);

module.exports = router;