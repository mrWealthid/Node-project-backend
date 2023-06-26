// const catchAsync = require('../utils/catchAsync');
const Transaction = require('../model/transactionModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// exports.setTransUserIds = (req, res, next) => {
//   // if (!req.body.transactionRef) req.body.transactionRef = req.params.transRef;
//   if (!req.body.userId) req.body.userId = req.params.userId;
//   if (!req.body.user) req.body.user = req.user.id;
//   next();
// };

exports.getAllTransactions = factory.getAll(Transaction);
exports.getTransaction = factory.getOne(Transaction);
exports.createTransaction = catchAsync(async (req, res, next) => {
  const initiator = req.body.initiatorAccountNumber;
  const beneficiary = req.body.beneficiaryAccountNumber;

  if (initiator === beneficiary)
    return next(new AppError("You can't Transfer to self", 404));
  const settlement = {
    ...req.body,

    amount: req.body.amount * -1,
    transactionType: 'debit',
    user: req.user.id,
  };

  const doc = await Transaction.create(req.body);
  await Transaction.create(settlement);

  // const checkTransactionStatus = doc.every((val) => val.status === 'fulfilled');
  //
  // if()
  // "initiatorName": "Wealth Bank",
  //   "amount": 200000,
  //   "transactionType": "credit",
  //   "user":"647a9a9451eb622b52ff67f3",
  //   "initiatorAccountNumber":1234567,
  //   "beneficiaryAccountNumber":8720650
  //

  res.status(201).json({
    status: 'success',
    data: { data: doc },
  });
});

exports.deleteTransaction = factory.deleteOne(Transaction);
exports.updateTransaction = factory.updateOne(Transaction);
