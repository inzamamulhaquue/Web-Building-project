const statusCode = require('./constant');

const response = {
  statusCode: statusCode.STATUS_CODE.OK,
  msg: 'Request Success',
  errorMessage: 'Something went wrong, Kindly try again',
  success: function ({ res, headers, status, msg, data }) {
    if (headers) {
      res.set(headers);
    }
    if (!data) {
      this.statusCode = statusCode.STATUS_CODE.NO_CONTENT;
    }else{
      this.statusCode = statusCode.STATUS_CODE.OK;
    }
    res.status(status || this.statusCode).json({
      msg: msg || this.message,
      data: data,
    });
  },
  error: function ({ res, headers, status, msg, data }) {
    if (headers) {
      res.set(headers);
    }
    res.status(status || 400).json({
      msg: msg || this.errorMessage,
      data: data,
    });
  },
};

module.exports = response;
