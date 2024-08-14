const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Types;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      default: null,
    },
    lastName: {
      type: String,
      default: null,
    },
    walletAmount: {
      type: Number,
      default: 1000,
    },
    // userName: {
    //   type: String,
    //   lowercase: true,
    //   default: null,
    // },
    company: {
      type: String,
      lowercase: true,
      default: null,
    },
    state: {
      type: ObjectId,
    },
    city: {
      type: ObjectId,
    },
    type: {
      type: String,
      default: "Both",
      // enum: ["CRM", "DB Site", "Both"],
    },
    email: {
      id: {
        type: String,
        lowercase: true,
      },
      secondaryEmail: {
        type: String,
        lowercase: true,
        default: null,
      },
      mobile: {
        type: Number,
        default: null,
      },
      password: {
        type: String,
        default: null,
      },
      registrationType: {
        type: String,
        enum: ["Google", "Email", "Linkedin"],
        default: "Email",
      },
      verified: {
        type: Boolean,
        default: false,
      },
      token: {
        token: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
      },
    },
    forgotPassword: {
      token: {
        type: String,
        default: null,
      },
      expiryDate: {
        type: Date,
        default: Date.now(),
      },
      createdAt: {
        type: Date,
        default: null,
      },
    },
    PropertyType: {
      type: String,
      enum: ["residential", "commercial", "both"],
    },
    profilePicture: {
      type: String,
      default: null,
    },
    jti: {
      // jwt token identifier
      ip: {
        type: String,
        default: null,
      },
      access: {
        type: String,
        default: null,
      },
      refresh: {
        type: String,
        default: null,
      },
    },
    status: {
      //block account by admin
      type: Boolean,
      default: true,
    },
    blocked: {
      // block user accounts on failed attempts
      status: { type: Boolean, default: false },
      expiry: { type: Date, default: null },
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("users", userSchema);
