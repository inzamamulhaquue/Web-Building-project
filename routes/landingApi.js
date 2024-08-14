const express = require('express');
const router1 = express.Router();
const Lander= require('../controller/others');

router1.get("/landing-api",Lander.Landing_api);
module.exports = router1;