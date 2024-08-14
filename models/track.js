const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Types;

// Tracking
const trackSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      index: true,
    },
    building: [{ type: Schema.ObjectId, ref: 'buildings' }],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('track', trackSchema);
