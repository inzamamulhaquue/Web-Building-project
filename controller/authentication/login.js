const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const moment = require("moment");
const Response = require("../../helpers/response");
const Constant = require("../../helpers/constant");
const { handleException } = require("../../helpers/exception");
const LoginValidation = require("../../helpers/joi-validation");
const User = require("../../models/user");
const { async } = require("crypto-random-string");

const { JWT_SECRET, JWT_SECRET_SSO } = process.env;

/**
 * Generate JWT Token
 *
 * @param {object} payload (payload)
 * @param {string} type (type Access | Refresh)
 */
const generateJWTToken = (payload, type, ip) => {
  const jti = crypto.randomBytes(10).toString("hex");
  let jtiObject = {};
  if (type !== "Access") {
    // payload.exp = 600 * 60; // 90 minutes
    payload.exp = "1day";
    jtiObject = {
      "jti.refresh": jti,
      "jti.ip": ip,
    };
  } else {
    // payload.exp = 600 * 60; // 60 minutes
    payload.exp = "2day";
    jtiObject = {
      "jti.access": jti,
      "jti.ip": ip,
    };
  }
  return new Promise(async (resolve, reject) => {
    try {
      const { name, userId, PropertyType } = payload;
      const token = jwt.sign(
        {
          iss: "BFI",
          aud: "BFI",
          userId,
          name,
          type,
          jti,
          PropertyType,
        },
        JWT_SECRET,
        {
          expiresIn: payload.exp,
        }
      );
      await User.findByIdAndUpdate({ _id: userId }, { $set: jtiObject });
      resolve(token);
    } catch (error) {
      reject(error.message);
    }
  });
};

const generateJWTTokenForSSO = (payload, type, ip, auth = true) => {
  const jti = crypto.randomBytes(10).toString("hex");
  let jtiObject = {};
  if (type !== "Access") {
    // payload.exp = auth ? 2 * 60 : 90 * 60; // 90 minutes
    payload.exp = "1day";
    jtiObject = {
      "jti.refresh": jti,
      "jti.ip": ip,
    };
  } else {
    // payload.exp = 60 * 60; // 60 minutes
    payload.exp = "2day";
    jtiObject = {
      "jti.access": jti,
      "jti.ip": ip,
    };
  }
  return new Promise(async (resolve, reject) => {
    try {
      const { name, userId } = payload;
      const token = jwt.sign(
        {
          iss: "BFI",
          aud: "BFI",
          userId,
          name,
          type,
          jti,
        },
        JWT_SECRET_SSO,
        {
          expiresIn: payload.exp,
        }
      );
      await User.findByIdAndUpdate({ _id: userId }, { $set: jtiObject });
      resolve(token);
    } catch (error) {
      reject(error.message);
    }
  });
};

/**
 * Refresh token
 * to generate new access token
 */
const refreshToken = async (req, res) => {
  const { logger } = req;
  try {
    const { userId } = req.decoded;
    const userInfo = await User.findById({ _id: userId });
    const payload = {
      exp: 90 * 60, // 90 minutes
      userId,
      name: userInfo.name,
    };
    const accessToken = await generateJWTToken(payload, "Access", req.clientIp);
    const refreshToken = await generateJWTToken(
      payload,
      "Refresh",
      req.clientIp
    );

    const obj = {
      res,
      msg: Constant.INFO_MSGS.SUCCESSFUL_LOGIN,
      status: Constant.STATUS_CODE.OK,
      data: {
        accessToken,
        refreshToken,
      },
    };
    return Response.success(obj);
  } catch (error) {
    console.log("refreshToken Error", error);
    return handleException(logger, res, error);
  }
};

const refreshTokenForSSO = async (req, res) => {
  const { logger } = req;
  try {
    const { userId } = req.decoded;
    const userInfo = await User.findById({ _id: userId });
    const payload = {
      exp: 90 * 60, // 90 minutes
      userId,
      name: userInfo.name,
    };
    const accessToken = await generateJWTTokenForSSO(
      payload,
      "Access",
      req.clientIp
    );
    const refreshToken = await generateJWTTokenForSSO(
      payload,
      "Refresh",
      req.clientIp,
      false
    );
    const obj = {
      res,
      msg: Constant.INFO_MSGS.SUCCESSFUL_LOGIN,
      status: Constant.STATUS_CODE.OK,
      data: {
        accessToken,
        refreshToken,
      },
    };
    return Response.success(obj);
  } catch (error) {
    return handleException(logger, res, error);
  }
};

/**
 * Login
 */
const login = async (req, res) => {
  const { logger } = req;
  try {
    const type = req.query.type;
    const { error } = LoginValidation.login(req.body);
    if (error) {
      const obj = {
        res,
        status: Constant.STATUS_CODE.BAD_REQUEST,
        msg: error.details[0].message,
      };
      return Response.error(obj);
    }
    const { email, password } = req.body;
    const userInfo = await User.findOne({ "email.id": email });
    if (!userInfo) {
      const obj = {
        res,
        status: Constant.STATUS_CODE.BAD_REQUEST,
        msg: Constant.ERROR_MSGS.ACCOUNT_NOT_FOUND,
      };
      return Response.error(obj);
    }
    if (userInfo.email.registrationType !== "Email") {
      const obj = {
        res,
        status: Constant.STATUS_CODE.BAD_REQUEST,
        msg:
          userInfo.email.registrationType === "Google"
            ? Constant.ERROR_MSGS.LOGIN_WITH_GOOGLE
            : Constant.ERROR_MSGS.LOGIN_WITH_GOOGLE,
      };
      return Response.error(obj);
    }
    if (userInfo.blocked.status) {
      const obj = {
        res,
        status: Constant.STATUS_CODE.BAD_REQUEST,
        msg: Constant.ERROR_MSGS.ACCOUNT_LOCKED,
      };
      return Response.error(obj);
    }
    if (!bcrypt.compareSync(password, userInfo.email.password)) {
      const obj = {
        res,
        status: Constant.STATUS_CODE.BAD_REQUEST,
        msg: Constant.ERROR_MSGS.INVALID_LOGIN,
      };
      return Response.error(obj);
    }
    if (!userInfo.status) {
      const obj = {
        res,
        status: Constant.STATUS_CODE.BAD_REQUEST,
        msg: Constant.ERROR_MSGS.ACCOUNT_DISABLED,
      };
      return Response.error(obj);
    }
    if (!userInfo.email.verified) {
      const userData = {
        name: userInfo.name,
        email: {
          id: userInfo.email.id,
          verified: userInfo.email.verified,
        },
      };

      const obj = {
        res,
        msg: Constant.INFO_MSGS.EMAIL_NOT_VERIFIED,
        status: Constant.STATUS_CODE.OK,
        data: {
          userData,
        },
      };
      return Response.success(obj);
    }
    const data = await commonAuth(
      logger,
      userInfo.name,
      userInfo._id,
      req.clientIp,
      type,
      userInfo.PropertyType
    );
    const userData = {
      email: {
        verified: userInfo.email.verified,
      },
      walletAmount: userInfo.walletAmount,
      messageInfo: true,
    };
    data.userData = userData;
    await User.findByIdAndUpdate(userInfo._id, {
      lastLogin: new Date(Date.now()),
    });
    const obj = {
      res,
      msg: Constant.INFO_MSGS.SUCCESSFUL_LOGIN,
      status: Constant.STATUS_CODE.OK,
      data,
    };
    return Response.success(obj);
  } catch (error) {
    console.log("Login Error : ", error);
    return handleException(logger, res, error);
  }
};

/**
 * Common Auth function for 2FA checking and JWT token generation
 */
const commonAuth = (logger, name, userId, ip, type, PropertyType) =>
  new Promise(async (resolve, reject) => {
    try {
      if (!type) {
        const payload = {
          exp: 15 * 60, // 10 minutes
          name,
          userId,
          PropertyType,
          ip,
        };
        const accessToken = await generateJWTToken(payload, "Access", ip);
        const refreshToken = await generateJWTToken(payload, "Refresh", ip);
        const data = {
          accessToken,
          refreshToken,
        };
        resolve(data);
      } else if (type === "landscap") {
        const payload = {
          exp: 2 * 60, // 10 minutes
          name,
          userId,
          PropertyType,
        };
        const accessToken = await generateJWTTokenForSSO(payload, "Access", ip);
        const refreshToken = await generateJWTTokenForSSO(
          payload,
          "Refresh",
          ip
        );
        const data = {
          accessToken,
          refreshToken,
        };
        resolve(data);
      }
    } catch (error) {
      console.log("common Auth Log :", error);
      reject(error);
    }
  });

/**
 * Logout (removed JTI from db and set it to null)
 * Allows single session Only
 */
const logout = async (req, res) => {
  const { logger } = req;
  try {
    if (!req.decoded) {
      const obj = {
        res,
        status: Constant.STATUS_CODE.RESOURCE_NOT_FOUND,
        msg: Constant.ERROR_MSGS.TOKEN_MISSING,
      };
      return Response.error(obj);
    }

    const { userId } = req.decoded;
    const user = await User.findById(userId);
    await User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          "jti.access": null,
          "jti.refresh": null,
          "jti.ip": null,
        },
      }
    );
    const obj = {
      res,
      msg: Constant.INFO_MSGS.SUCCESSFUL_LOGOUT,
      status: Constant.STATUS_CODE.OK,
    };
    return Response.success(obj);
  } catch (error) {
    console.log("logout error", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  refreshToken,
  login,
  generateJWTToken,
  logout,
  commonAuth,
  refreshTokenForSSO,
  generateJWTTokenForSSO,
};
