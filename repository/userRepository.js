const User = require('../models/user');
exports.getUserByQuery = async (query) => await User.findOne({ query });