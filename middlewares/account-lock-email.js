const RateLimit = require('express-rate-limit');
const randomString = require('crypto-random-string');
const MongoStore = require('rate-limit-mongo');
const moment = require('moment');
const mongoose = require('mongoose');
const User = require('../models/user');
const Constant = require('../helpers/constant');
const {
  DATABASE_URL,
  USER_LOGIN_RATE_LIMIT_WINDOW_MS,
//   FORGOT_PASSWORD_URL,
//   FORGOT_PASSWORD_ON_BLOCK_TEMPLATE_ID,
} = process.env;

let store = new MongoStore({
  uri: `${DATABASE_URL}`,
  expireTimeMs: parseInt(USER_LOGIN_RATE_LIMIT_WINDOW_MS), //2 min
  errorHandler: console.error.bind(null, 'rate-limit-mongo'),
  collectionName: 'account-lock-email',
});

/**
 * Decrements counter based on the message
 */
const decrement = async (req, res, next) => {
  res.on('finish', async function () {
    if (
      res.statusCode === 400 &&
      res.body.msg !== Constant.ERROR_MSGS.INVALID_LOGIN
    ) {
      store.decrement(req.body.email);
    }
    if (
      res.statusCode === 200 &&
      res.body.msg === Constant.INFO_MSGS.SUCCESSFUL_LOGIN
    ) {
      let exists = await mongoose.connection
        .collection('account-lock-email')
        .findOne({ _id: req.body.email });
      if (exists) {
        store.resetKey(req.body.email);
      }
    }
  });
};

/**
 * API Rate Limiter based on the routes
 * @returns
 */
const accountActivity = async function (req, res, next) {
  const { logger } = req;
  const rateLimitSetter = new RateLimit({
    delayMs: 0,
    store: store,
    max: 5,
    windowMs: parseInt(USER_LOGIN_RATE_LIMIT_WINDOW_MS), //2 min
    keyGenerator: function (req, res) {
      return req.body.email;
    },
    skipSuccessfulRequests: true,
    statusCode: 400,
    onLimitReached: async function (req, res) {
      const user = await User.findOne(
        {
          'email.id': req.body.email,
        },
        {
          blocked: 1,
        },
      );
      if (!user.blocked.status) {
        let expireDate = moment(new Date(), 'MM-DD-YYYY').add(2, 'day');
        let tokenExpiryDate = moment(new Date(), 'MM-DD-YYYY').add(2, 'hours');

        const token = randomString({
          length: 15,
          type: 'url-safe',
        });
        const userInfo = await User.findOneAndUpdate(
          {
            'email.id': req.body.email,
          },
          {
            $set: {
              'forgotPassword.token': token,
              'forgotPassword.createdAt': Date.now(),
              'forgotPassword.expiryDate': tokenExpiryDate,
              'blocked.status': true,
              'blocked.expiry': expireDate,
              'jti.access': null,
              'jti.refresh': null,
            },
          },
          { new: true },
        );

        // const payload = {
        //   name: userInfo.name,
        //   verifyLink: `${FORGOT_PASSWORD_URL}${token}`,
        // };
        // await Email.Email(
        //   logger,
        //   FORGOT_PASSWORD_ON_BLOCK_TEMPLATE_ID,
        //   req.body.email,
        //   payload,
        // );
      }
      return;
    },
    message: {
      msg: Constant.ERROR_MSGS.ACCOUNT_LOCKED_EMAIL_TRIGGERED,
    },
  });
  rateLimitSetter.call(this, ...arguments);
  return decrement(req, res, next);
};

module.exports = {
  accountActivity,
};
