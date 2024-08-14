const express = require("express");
const router = express.Router();
const building = require("../controller/building/buildingController");
const buildingFloor = require("../controller/building/buildingFloor");
const View = require("../controller/building/view");
const Track = require("../controller/building/track");
const buildingFilter = require("../controller/building/buildingFilter");
const { auth } = require("../middlewares/auth");

router.use(auth);

// Building Routes
router.get("/building-get-by-id/:id", building.getBuildingById);
router.get("/get-all-building", building.getAllBuilding);
router.get("/buildngAutoComplete", building.buildingAutoComplete);
router.get("/get-floor-by-id/:buildingId", building.getAllMala);
router.get("/get-flat-by-id/:buildingId/:MalaNo", building.getAllFlat);
// router.get("/getAllDuplicateBuilding", building.getAllDuplicateBuilding);

// Registry Routes
router.post("/view-registry", View.registryViews);
router.get("/get-all-transaction", building.getAllregistry);
router.get("/get-allTransaction", building.getAllTransaction);
router.get("/get-by-id-transaction/:_id", building.getByIdTransaction);

// Building View & Track Routes
router.post("/view-building", View.buildingViews);
router.post("/track-building", Track.buildingTrack);
router.get("/get-track-list", Track.getTrackList);
router.post("/delete-building", Track.deleteBuildingTrack);

// Buildin-Filter Route
router.post("/addfilter", auth, buildingFilter.addFilter);
router.get("/get-filter", buildingFilter.getFilterById);
router.put("/update-filter/:id", buildingFilter.updateFilter);
router.delete("/delete-filter/:id", buildingFilter.deleteFilter);

// Building Floor Route
router.get("/get-all-buildingfloor", buildingFloor.getAllBuildingFloor);
router.get("/get-byid-buildingfloor", buildingFloor.getByIdBuildingFloor);
router.post("/get-building-tran-by-building", buildingFloor.getLetestTrans)
router.get("/getBuildingFloorsByBuildingId/:id", buildingFloor.getBuildingFloorsByBuildingId);

// Index2 Download Route
router.get("/downloadIndex2", building.downloadIndex2);


module.exports = router;
