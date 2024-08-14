const jwt = require("jsonwebtoken");
const _ = require("underscore");
const User = require("../models/user");
const Response = require("../helpers/response");
const Constant = require("../helpers/constant");
const { handleException } = require("../helpers/exception");

const { JWT_SECRET } = process.env;

/**
 * Verify JWT Token
 *
 * @param {object} jwt (json web token)
 */
const auth = async (req, res, next) => {
	const { logger } = req;
	try {
		let token =
			req.body.token || req.query.token || req.headers["x-auth-token"];
		if (
			_.isUndefined(token) ||
			_.isEmpty(token) ||
			token.length == 0 ||
			token.toString() === "null"
		) {
			const obj = {
				res,
				status: Constant.STATUS_CODE.UN_AUTHORIZED,
				msg: Constant.ERROR_MSGS.TOKEN_MISSING,
			};
			return Response.error(obj);
		}

		if (!token) {
			const obj = {
				res,
				status: Constant.STATUS_CODE.UN_AUTHORIZED,
				msg: Constant.ERROR_MSGS.INVALID_TOKEN_FORMAT,
			};
			return Response.error(obj);
		}
		// Remove Bearer from string
		token = token.slice(7, token.length).trimLeft();
		jwt.verify(token, JWT_SECRET, async (err, decoded) => {
			if (err) {
				console.log("token vrify error:  ", err);
				const obj = {
					res,
					status: Constant.STATUS_CODE.UN_AUTHORIZED,
					msg: Constant.ERROR_MSGS.TOKEN_SESSION_EXPIRED,
				};
				return Response.error(obj);
			}
			const { email, name, PropertyType } = await User.findById(decoded.userId);
			if (email && email.id) {
				decoded.email = email.id;
				decoded.name = name;
				decoded.PropertyType = PropertyType;
			}

			if (req.url === "/token" && decoded.type === "Refresh") {
				req.decoded = decoded;
				const { status, msg } = await jwtDBChecker(
					decoded,
					"refresh",
					req.clientIp
				);
				if (msg == null) {
					next();
				} else {
					const obj = {
						res,
						status: status,
						msg: msg,
					};
					return Response.error(obj);
				}
			} else if (decoded.type === "Access" && req.url !== "/token") {
				req.decoded = decoded;
				const { status, msg } = await jwtDBChecker(
					decoded,
					"access",
					req.clientIp
				);
				if (msg == null) {
					next();
				} else {
					const obj = {
						res,
						status: status,
						msg: msg,
					};
					return Response.error(obj);
				}
			} else {
				const obj = {
					res,
					status: Constant.STATUS_CODE.UN_AUTHORIZED,
					msg: Constant.ERROR_MSGS.INVALID_TOKEN_TYPE,
				};
				return Response.error(obj);
			}
		});
	} catch (error) {
		console.log("auth error", error);
		return handleException(logger, res, error);
	}
};

/**
 * Checks JTI in DB
 */
const jwtDBChecker = async (decoded, type, ip) => {
	return new Promise(async (resolve, reject) => {
		try {
			const user = await User.findById({ _id: decoded.userId });
			if (!user) {
				return resolve({
					status: Constant.STATUS_CODE.UN_AUTHORIZED,
					msg: Constant.ERROR_MSGS.TOKEN_SESSION_EXPIRED,
				});
			} else if (user.jti[type] === decoded.jti) {
				return resolve({
					status: Constant.STATUS_CODE.OK,
					msg: null,
				});
			} else {
				await User.findByIdAndUpdate(
					{ _id: decoded.userId },
					{
						$set: {
							"jti.access": null,
							"jti.refresh": null,
							"jti.ip": null,
						},
					}
				);
				return resolve({
					status: Constant.STATUS_CODE.UN_AUTHORIZED,
					msg: Constant.ERROR_MSGS.TOKEN_SESSION_EXPIRED,
				});
			}
		} catch (error) {
			return reject(error);
		}
	});
};

module.exports = { auth };
