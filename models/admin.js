const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Types;

const adminSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      default: null,
    },
    userName: {
      type: String,
      lowercase: true,
      default: null,
      trim: true,
    },
    company: {
      type: String,
      lowercase: true,
      default: null,
      trim: true,
    },
    type: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
    email: {
      id: {
        type: String,
        lowercase: true,
        trim: true,
      },
      secondaryEmail: {
        type: String,
        lowercase: true,
        default: null,
        trim: true,
      },
      password: {
        type: String,
        default: null,
      },
      registrationType: {
        type: String,
        enum: ["Google", "Email"],
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
    role: {
      type: ObjectId,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("admins", adminSchema);
