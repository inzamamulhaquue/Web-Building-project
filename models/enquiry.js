const mongoose = require('mongoose');

// define a Mongoose schema
const enquirySchema = new mongoose.Schema({
      name: String,
      email: String,
      phone: Number,
      userId: {
            type: mongoose.Types.ObjectId,
            default: null,
            ref: 'users'
      },
      status: {
            type: String,
            default: 'OPEN',
      },
      message: String,
      openedOn: Date,
      closedOn: Date,
}, { timestamps: true });

module.exports = mongoose.model('enquiry', enquirySchema);
