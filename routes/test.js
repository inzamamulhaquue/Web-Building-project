const express = require('express');
const router = express.Router();
const View = require('../controller/test/view');
// const { auth } = require('../middlewares/auth');

// router.use(auth);

router.get("/get-test", View.GET);
router.post("/insert-test", View.INSERT);
router.put("/update-test", View.UPDATE);
router.delete("/delete-test", View.DELETE);

module.exports = router;