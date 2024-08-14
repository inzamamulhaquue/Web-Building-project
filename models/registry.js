require("dotenv").config({ path: "../config/.env" });
const mongoose = require("mongoose");
const mongoosastic = require("mongoosastic");
const elasticsearch = require("elasticsearch");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Types;

var registrySchema = new Schema(
  {
    DocumentNo: {
      type: String,
      default: null,
      // unique: true
    },
    DocumentName: {
      type: String,
      default: null,
    },
    RegistrationDate: {
      type: Date,
      default: null,
    },
    SROName: {
      type: String,
      default: null,
    },
    SellerName: {
      type: String,
      default: null,
    },
    PurchaserName: {
      type: String,
      default: null,
    },
    PurchaserEmail: {
      type: String,
      trim: true,
      default: null,
    },
    SellerEmail: {
      type: String,
      trim: true,
      default: null,
    },
    PurchaserContact: {
      type: Number,
      default: null,
    },
    SellerContact: {
      type: Number,
      default: null,
    },
    PropertyDescription: {
      type: String,
      default: null,
    },
    SROCode: {
      type: Number,
      default: null,
    },
    Status: {
      type: Number,
      default: null,
    },
    Name: {
      type: String,
      default: null,
    },
    Age: {
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
    FlatNo: {
      type: String,
      default: null,
    },
    BuildingName: {
      type: String,
      default: null,
      trim: true, // Trims the whitespace before and after the string
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
    purchaser_aadhar_no: {
      type: String,
      default: null,
    },
    purchase_pan_no: {
      type: String,
      default: null,
    },
    seller_aadhar_no: {
      type: String,
      default: null,
    },
    seller_pan_no: {
      type: String,
      default: null,
    },
    AgreementNo: {
      type: String,
      default: null,
    },
    Date: {
      type: Date,
      default: null,
    },
    Time: {
      type: String,
      default: null,
    },
    DocumentSerialNo: {
      type: String,
      default: null,
    },
    DocumentType: {
      type: String,
      enum: ["Sale", "Rent", "Mortgage", "TBD", "Not Needed", "NA"],
      default: null,
    },
    DHCfeesOrDocumentHandlingCharges: {
      type: String,
      default: null,
    },
    RegistrationFees: {
      type: String,
      default: null,
    },
    BazarMulyaOrMarketRate: {
      type: String,
      default: null,
    },
    MobdalaOrConsideration: {
      type: String,
      default: null,
    },
    Bharlele_Mudrank_ShulkhOr_Stamp_Duty_Paid: {
      type: String,
      default: null,
    },
    MTR: {
      type: String,
      default: null,
    },
    rate: {
      type: Number,
      default: null,
    },
    Corporate_Identification_number_or_CIN: {
      type: String,
      default: null,
    },
    License_Period: {
      type: String,
      default: null,
    },
    Lock_In_Period: {
      type: String,
      default: null,
    },
    Fit_out_Period: {
      type: String,
      default: null,
    },
    Escalation_in_Licensee_fees: {
      type: String,
      default: null,
    },
    CAM_Or_Common_Area_Maintenance: {
      type: Number,
      default: null,
    },
    Security_Deposit: {
      type: String,
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
    SquareFeet: {
      type: Number,
      default: null,
    },
    totalSquareFeet: {
      type: Number,
      default: null,
    },
    buildingId: {
      type: ObjectId,
      index: true,
    },
    SecondaryRegistrar: {
      type: String,
      default: null,
    },
    Compensation: {
      type: Number,
      default: null,
    },
    MarketPrice: {
      type: Number,
      default: null,
    },
    SubDivisionHouseNo: {
      type: String,
      default: null,
    },
    Area: {
      type: String,
      default: null,
    },
    Levy: {
      type: String,
      default: null,
    },
    NameAndAddressPartyOfExecutingDocument: {
      type: String,
      default: null,
    },
    NameAndAddressOfDefedent: {
      type: String,
      default: null,
    },
    DocumentSubmissionDate: {
      type: Date,
      default: null,
    },
    DateOfRegistrationDeed: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    SerialNumber: {
      type: String,
      default: null,
    },
    Shera: {
      type: String,
      default: null,
    },
    OtherDetails: {
      type: String,
      default: null,
    },
    DetailsConsideredForAssessment: {
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
    buildingType: {
      type: String,
      enum: ["commercial", "residential", "all", "both", "others"],

      // enum: ['Commercial', 'Residential', 'All'],
      default: null,
    },
    buildingStructure: {
      type: String,
      default: null,
    },
    locality: {
      type: String,
      default: null,
    },
    Developer: {
      type: String,
      default: null,
    },
    // parkingInformation: {
    // 	type: String,
    // 	default: null,
    // },
    auth_rep_seller_name: {
      type: String,
      default: null,
    },
    auth_rep_seller_role: {
      type: String,
      default: null,
    },
    auth_rep_purchaser_name: {
      type: String,
      default: null,
    },
    auth_rep_purchaser_role: {
      type: String,
      default: null,
    },
    sellerLeaserContactNumber: {
      type: String,
      default: null,
    },
    purchaserLeaseeContactNumber: {
      type: String,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    microMarketId: {
      // micromarket id
      type: ObjectId,
      default: null,
    },
    microMarket: {
      type: ObjectId,
      default: null,
    },
    unit_condition: {
      type: String,
      default: null,
    },
    unit_status: {
      type: String, // ?????
      default: null,
    },
    built_up_area: {
      type: Number,
      default: null,
    },
    rent_rate: {
      type: Number,
      default: null,
    },
    sale_value: {
      type: Number,
      default: null,
    },
    sale_rate: {
      type: Number,
      default: null,
    },
    rent_purchaser_fees: {
      type: Number,
      default: null,
    },
    notice_date: {
      type: Date,
      default: null,
    },
    carpetArea: {
      type: Number,
      default: null,
    },
    payment_of_furniture_charges: {
      type: Number,
      default: null,
    },
    parking_info_two_wheeler: {
      type: String,
      default: null,
    },
    parking_info_four_wheeler: {
      type: String,
      default: null,
    },
    right_of_refusal_active: {
      type: String,
      default: null,
    },
    right_of_refusal_floors: {
      type: String,
      default: null,
    },
    archive: {
      type: Boolean, // true for disabled, false for enabled
      default: false,
    },
    unit_status: {
      type: String,
      default: "To Be Confirmed",
    },
    remarks: {
      type: String,
      default: null,
    },
    igrPdfLink: {
      type: String,
      default: null,
    },
    igrVillageName: {
      type: String,
      default: null,
    },
    pdfName: {
      type: String,
      default: null,
    },
    igrTalukaName: {
      type: String,
      default: null,
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
    file: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "admins",
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "admins",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// create location index
registrySchema.index({ location: "2dsphere" });

// define the Elasticsearch client
// const esClient = new elasticsearch.Client({
// 	host: process.env.ELASTIC_HOST,
// 	httpAuth: process.env.ELASTIC_AUTH,
// });

// // add the mongoosastic plugin to the schema
// registrySchema.plugin(mongoosastic, {
// 	esClient: esClient,
// 	hydrate: true,
// 	bulk: {
// 		// Set a delay of 2 seconds between each bulk insert operation
// 		delay: 2000,
// 	},
// });

// create the Registry Model
const Registry = mongoose.model("registry", registrySchema);

// index all existing documents in Elasticsearch
// Registry.syncIndexes();

// listen for changes to the Registry Model and update Elasticsearch accordingly
// Registry.watch().on("change", async (change) => {
// 	const documentId = change.documentKey._id.toString();

// 	if (change.operationType === "insert") {
// 		// Remove _id field from document body
// 		let { _id, ...documentBody } = change.fullDocument;
// 		documentBody = documentBody.buildingId
// 			? {
// 					...documentBody,
// 					buildingId: documentBody.buildingId.toString(),
// 			  }
// 			: documentBody;
// 		// insert a new document in Elasticsearch
// 		await esClient.index({
// 			index: "registries",
// 			id: documentId,
// 			body: documentBody,
// 		});
// 	} else if (change.operationType === "update") {
// 		// Remove _id field from updated fields
// 		let { _id, ...updatedFields } = change.updateDescription.updatedFields;
// 		updatedFields = updatedFields.buildingId
// 			? {
// 					...updatedFields,
// 					buildingId: updatedFields.buildingId.toString(),
// 			  }
// 			: updatedFields;

// 		// update a document in Elasticsearch
// 		await esClient.update({
// 			index: "registries",
// 			id: documentId,
// 			body: {
// 				doc: updatedFields,
// 			},
// 		});
// 	} else if (change.operationType === "delete") {
// 		// delete a document from Elasticsearch
// 		await esClient.delete({
// 			index: "registries",
// 			id: documentId,
// 		});
// 	}
// });

module.exports = Registry;
