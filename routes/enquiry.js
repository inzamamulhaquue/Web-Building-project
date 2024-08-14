const express = require('express');
const router = express.Router();
const View = require('../controller/enquiry/enquiryApis');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.post("/enquiry", View.addNewEnquiry)


module.exports = router;