const Constant = require('./constant');
const Response = require('./response');

const handleException = (logger, res, error) => {

  const obj = {
    res,
    status: Constant.STATUS_CODE.INTERNAL_SERVER_ERROR,
    msg: error || Constant.ERROR_MSGS.INTERNAL_SERVER_ERROR,
  };
  return Response.error(obj);
};

module.exports = { handleException };
