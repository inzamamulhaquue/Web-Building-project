const express = require('express');
const router = express.Router();
const View = require('../controller/building/view');
const analytics = require('../controller/analytics/analytics');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get("/dashboard-view", View.viewDashboard)
router.get('/get-total-stock/:id', analytics.getTotalStock);
// router.get('/get-total-stock-by-years/:id', analytics.getTotalStockByYears);
router.get('/top-demand', analytics.findDemand);
router.get('/top-supply', analytics.findTopSupply);
router.get('/yield', analytics.findYield);

router.get('/find-supply-by-years', analytics.findTopSupplyByYears);
router.get('/rent-value-by-micromarket', analytics.rentValueByMicromarket);
router.get('/upcomming-supply', analytics.upcommingSupply);

module.exports = router;