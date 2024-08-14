const { Schema, model } = require("mongoose");

const walletSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users"
    },
    transactionNo:{
      type: Number,
      default: 0,
    },
    availableAmount: {
      type: Number,
      default: 0,
    },
    creditAmount: {
      type: Number,
      default: 0,
    },
    debitAmount: {
      type: Number,
      default: 0,
    },
    remark:{
      type: String,
      default:null
    }
  },
  { timestamps: true }
);

module.exports = model("wallet", walletSchema);