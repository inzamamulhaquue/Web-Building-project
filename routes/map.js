const express = require('express');
const router = express.Router();
const Buildings = require('../controller/map/buildings/POST');
const Registries = require('../controller/map/registries/POST');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get("/map/buildings", Buildings.getBuildingInRadius)
router.get("/map/registries", Registries.getRegistriesRadius)

module.exports = router;