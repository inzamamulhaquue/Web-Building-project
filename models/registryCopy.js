const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Types;

const registrycopySchema = new Schema(
  {
    DocumentNo: {
      type: String,
      default: null,
      unique: true
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
      type: Number,
      default: null,
    },
    MalaNo: {
      type: Number,
      default: null,
    },
    FlatNo:{
      type: Number,
      default: 0,
    },
    BuildingName: {
      type: String,
      default: null,
    },
    BlockNo: {
      type: String,
      default: null,
    },
    PinCode: {
      type: String,
      default: null,
    },
    Others: {
      type: String,
      default: null,
    },
    AadharNO: {
      type: String,
      default: null,
    },
    PAN_No: {
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
    rate:{
      type: Number,
      default: null,
    },
    Corporate_Identification_number_or_CIN: {
      type: String,
      default: null,
    },
    Parking_Information: {
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
    Fit_our_eriod: {
      type: String,
      default: null,
    },
    Escalation_in_Licensee_fees: {
      type: String,
      default: null,
    },
    CAM_Or_Common_Area_Maintenance: {
      type: String,
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
    buildingId: {
      type: ObjectId,
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
    expiryDate:{
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
    Developer:{
      type: String,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('registrycopy', registrycopySchema);