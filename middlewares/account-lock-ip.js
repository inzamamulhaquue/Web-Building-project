const RateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');
const mongoose = require('mongoose');
const Constant = require('../helpers/constant');
const {
  DATABASE_URL,
  IP_LOGIN_RATE_LIMIT_WINDOW_MS,
} = process.env;

let store = new MongoStore({
  uri: `${DATABASE_URL}`,
  expireTimeMs: parseInt(IP_LOGIN_RATE_LIMIT_WINDOW_MS), //2 hours
  errorHandler: console.error.bind(null, 'rate-limit-mongo'),
  collectionName: 'account-lock-ip',
});

/**
 * Decrements counter based on the message
 */
const decrement = async (req, res, next) => {
  res.on('finish', async function () {
    if (
      res.statusCode === 400 &&
      res.body.msg !== Constant.ERROR_MSGS.INVALID_LOGIN &&
      res.body.msg !== Constant.ERROR_MSGS.ACCOUNT_LOCKED
    ) {
      store.decrement(req.clientIp);
    }
    if (
      res.statusCode === 200 &&
      res.body.msg === Constant.INFO_MSGS.SUCCESSFUL_LOGIN
    ) {
      let exists = await mongoose.connection
        .collection('account-lock-ip')
        .findOne({ _id: req.clientIp });
      if (exists) {
        store.resetKey(req.clientIp);
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
    windowMs: parseInt(IP_LOGIN_RATE_LIMIT_WINDOW_MS), //2 hours
    keyGenerator: function (req, res) {
      return req.clientIp;
    },
    skipSuccessfulRequests: true,
    statusCode: 400,
    onLimitReached: async function (req, res) {
      return;
    },
    message: {
      msg: Constant.ERROR_MSGS.IP_LOCKED,
    },
  });
  rateLimitSetter.call(this, ...arguments);
  return decrement(req, res, next);
};

module.exports = {
  accountActivity,
};
