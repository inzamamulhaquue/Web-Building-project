const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const _ = require('underscore');
const axios = require('axios');
const Response = require('../helpers/response');
const Constant = require('../helpers/constant');

const googleAuthTokenVerify = async (req, res, next) => {
  const { logger } = req;
  try {
    if (
      _.isEmpty(req.body.tokenId) ||
      _.isUndefined(req.body.tokenId) ||
      req.body.tokenId.length == 0 ||
      req.body.tokenId.toString() === 'null'
    ) {
      const obj = {
        res,
        status: Constant.STATUS_CODE.BAD_REQUEST,
        msg: Constant.ERROR_MSGS.TOKEN_MISSING,
      };
      return Response.error(obj);
    }
    client
      // .verifyIdToken({
      //   idToken: req.body.tokenId,
      //   audience: process.env.CLIENT_ID,
      // })
      .getTokenInfo(req.body.tokenId)
      .then((result) => {
        axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${req.body.tokenId}`)
        .then((res) => {
          req.decoded = res.data
          next();
        })
        .catch((error) => {
          logger.error(error);
          const obj = {
            res,
            status: Constant.STATUS_CODE.BAD_REQUEST,
            msg: Constant.ERROR_MSGS.GOOGLE_AUTHENTICATION_FAILED,
          };
          return Response.error(obj);
        })
      })
      .catch((err) => {
        const obj = {
          res,
          status: Constant.STATUS_CODE.BAD_REQUEST,
          msg: Constant.ERROR_MSGS.GOOGLE_AUTHENTICATION_FAILED,
        };
        return Response.error(obj);
      });
  } catch (error) {
    logger.error(error);
    const obj = {
      res,
      status: Constant.STATUS_CODE.INTERNAL_SERVER_ERROR,
      msg: Constant.ERROR_MSGS.INTERNAL_SERVER_ERROR,
    };
    return Response.error(obj);
  }
};

module.exports = { googleAuthTokenVerify };
