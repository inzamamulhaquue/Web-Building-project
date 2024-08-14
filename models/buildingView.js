const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const Schema = mongoose.Schema;

/**
 * IP List schema
 */
const ipSubDocumentSchema = new Schema(
  {
    ip: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * User List schema
 */
const userSubDocumentSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Store Views of Building based on IP address and User ID
 */
const viewSchema = new Schema(
  {
    buildingId: {
      type: ObjectId,
      required: true,
      index: true,
    },
    ip_list: [ipSubDocumentSchema],
    user_list: [userSubDocumentSchema],
    numberOfViews: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('buildingViews', viewSchema);
