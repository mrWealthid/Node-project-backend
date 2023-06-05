// const catchAsync = require('../utils/catchAsync');
const Transaction = require('../model/transactionModel');
const factory = require('./handlerFactory');

exports.setTransUserIds = (req, res, next) => {
  // if (!req.body.transactionRef) req.body.transactionRef = req.params.transRef;
  if (!req.body.userId) req.body.userId = req.params.userId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllTransactions = factory.getAll(Transaction);
exports.getTransaction = factory.getOne(Transaction);
exports.createTransaction = factory.createOne(Transaction);
exports.deleteTransaction = factory.deleteOne(Transaction);
exports.updateTransaction = factory.updateOne(Transaction);
