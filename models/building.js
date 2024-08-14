require("dotenv").config({ path: "../config/.env" });
const { Number } = require("mongoose");
const mongoose = require("mongoose");
const { object } = require("underscore");
const mongoosastic = require("mongoosastic");
const elasticsearch = require("elasticsearch");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Types;

const buildingSchema = new Schema(
  {
    BuildingName: {
      type: String,
      default: null,
      trim: true, // Trims the whitespace before and after the string
    },
    PropertyDescription: {
      type: String,
      default: null,
    },
    VillageName: {
      type: String,
      default: null,
    },
    // locality: {
    //   type: ObjectId,
    //   default: null,
    // },
    locality: {
      type: String,
      default: null,
    },
    Address: {
      type: String,
      default: null,
    },
    PlotNo: {
      type: String,
      default: null,
    },
    MalaNo: {
      type: String,
      default: null,
    },
    BlockNo: {
      type: String,
      default: null,
    },
    PinCode: {
      type: Number,
      default: null,
    },
    Others: {
      type: String,
      default: null,
    },
    buildingAge: {
      type: String,
      default: null,
    },
    totalSquareFeet: {
      type: Number,
      default: null,
    },
    totalFloor: {
      type: String,
      default: null,
    },
    DeclaredCircleRate:{
			type: Number,
			default: null,
		},
    totalFlat: {
      type: String,
      default: null,
    },
    totalRegistryTransaction: {
      type: String,
      default: null,
    },
    developer: {
      type: String,
      default: null,
    },
    buildingType: {
      type: String,
      enum: ["commercial", "residential", "others"],
      default: null,
    },
    buildingStructure: {
      type: String,
      default: null,
    },
    selectedType: {
      type: String,
      default: null,
    },
    buildingStatus: {
      type: String,
      default: null,
    },
    lat: {
      type: Number,
      default: null,
    },
    long: {
      type: Number,
      default: null,
    },
    city: {
      type: ObjectId,
      default: null,
    },
    state: {
      type: ObjectId,
      default: null,
    },
    rent: {
      type: Number,
      default: null,
    },
    assetsId: {
      type: ObjectId,
      default: null,
    },
    amenities: {
      type: Array,
      default: [],
    },
    buildingClassification :{
      type: Array,
      default: [ ]
    },
    // unitCondition: {
    //   type: String,
    //   default: null,
    // },
    // unitOccupancyStatus: {
    //   type: String,
    //   default: null,
    // },
    efficiency: {
      type: String,
      default: null,
    },
    loading: {
      type: String,
      default: null,
    },
    commercialsChargeable: {
      type: String,
      default: null,
    },
    commercialsCarpet: {
      type: String,
      default: null,
    },
    CAMChargeable: {
      type: String,
      default: null,
    },
    CAMCarpet: {
      type: String,
      default: null,
    },
    isRegistryPresent : {
      type: Boolean,
      default: false
    },
    // propTax: {
    //   type: String,
    //   default: null,
    // },
    // lockInMonths: {
    //   type: String,
    //   default: null,
    // },
    // securityDepositMonths: {
    //   type: String,
    //   default: null,
    // },
    commonCafeteria: {
      type: String,
      default: null,
    },
    powerBackup: {
      type: String,
      default: null,
    },
    aCType: {
      type: String,
      default: null,
    },
    remarks: {
      type: String,
      default: null,
    },
    // parkingInformation: {
    // 	type: String,
    // 	default: null,
    // },
    buildingTwoWheelerParking: {
      type: String,
      default: null,
    },
    buildingFourWheelerParking: {
      type: String,
      default: null,
    },
    commonAreaMaintenance: {
      type: String,
      default: null,
    },
    marketPrice: {
      type: String,
      default: null,
    },
    // carpetSqft: {
    //   type: String,
    //   default: null,
    // },
    // chargeableSqft: {
    //   type: String,
    //   default: null,
    // },
    floorPlateCarpet: {
      type: Number,
      default: null,
    },
    // area: {
    //   type: String,
    //   default: null,
    // },
    floorplateChargeable: {
      type: Number,
      default: null,
    },
    proposedAvailabilityDate: {
      type: Date,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    microMarketId:{   // micromarket id
      type: ObjectId,
      default: null,
    },
    microMarket: {   // locality id
      type: ObjectId,
      default: null,
    },
    archive: {
      type: Boolean, // true for disabled and false for enabled
      default: false,
    },
    CTS_No: {
      type: String,
      default: null,
    },
    buildingStats:{
      type: Array,
      default: [ ],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: false,
      },
      coordinates: {
        type: [Number],
        default: [],
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// create location index
buildingSchema.index({ location: "2dsphere" });

// define the Elasticsearch client
// const esClient = new elasticsearch.Client({
// 	host: process.env.ELASTIC_HOST,
// 	httpAuth: process.env.ELASTIC_AUTH,
// });

// // add the mongoosastic plugin to the schema
// buildingSchema.plugin(mongoosastic, {
// 	esClient: esClient,
// 	hydrate: true,
// 	bulk: {
// 		// Set a delay of 2 seconds between each bulk insert operation
// 		delay: 2000,
// 	},
// });
// create the Building model
const Buildings = mongoose.model("building", buildingSchema);

// index all existing documents in Elasticsearch
// Buildings.syncIndexes();

// listen for changes to the Building model and update Elasticsearch accordingly
// Buildings.watch().on("change", async (change) => {
// 	const documentId = change.documentKey._id.toString();

// 	if (change.operationType === "insert") {
// 		// Remove _id field from document body
// 		const { _id, ...documentBody } = change.fullDocument;

// 		// insert a new document in Elasticsearch
// 		await esClient.index({
// 			index: "buildings",
// 			id: documentId,
// 			body: documentBody,
// 		});
// 	} else if (change.operationType === "update") {
// 		// Remove _id field from updated fields
// 		const { _id, ...updatedFields } =
// 			change.updateDescription.updatedFields;

// 		// update a document in Elasticsearch
// 		await esClient.update({
// 			index: "buildings",
// 			id: documentId,
// 			body: {
// 				doc: updatedFields,
// 			},
// 		});
// 	} else if (change.operationType === "delete") {
// 		// delete a document from Elasticsearch
// 		await esClient.delete({
// 			index: "buildings",
// 			id: documentId,
// 		});
// 	}
// });

module.exports = Buildings;
