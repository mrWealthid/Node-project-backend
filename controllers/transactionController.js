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
    transactionType: 'Debit',
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

exports.getTransactionMonthlyStats = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const { type } = req.params;

  const isAdmin = req.user.role === 'admin';

  // if (req.user.role === 'user') {
  //   match.user = '6498e85c375e71310111c845';
  // }

  const stats = await Transaction.aggregate([
    // { $unwind: '$startDates' }, //The method seperates data from an array
    // {
    //   $lookup: {
    //     from: 'User', // Replace 'users' with the actual name of the user collection
    //     localField: '_id',
    //     foreignField: 'user',
    //     as: 'user',
    //   },
    // },
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },

        // beneficiaryAccountNumber: {
        //   $eq: 8720650,
        // },
        // $or: [
        //   { initiatorAccountNumber: { $eq: 8720650 } },
        //   { beneficiaryAccountNumber: { $eq: 8720650 } },
        // ],

        // initiatorAccountNumber: {
        //   $eq: 8720650,
        // },
        $or: [
          {
            $and: [
              { initiatorAccountNumber: { $eq: req.user.accountNumber } },
              { beneficiaryAccountNumber: { $ne: req.user.accountNumber } },
            ],
          },
          {
            $and: [
              { beneficiaryAccountNumber: { $eq: req.user.accountNumber } },
              { initiatorAccountNumber: { $ne: req.user.accountNumber } },
            ],
          },
          {
            $expr: {
              $eq: [isAdmin, true],
            },
          },
        ],
        transactionType: {
          $eq: `${type}`,
        },
      },
    },

    {
      $group: {
        _id: {
          $switch: {
            branches: [
              {
                case: { $eq: [{ $month: '$createdAt' }, 1] },
                then: { month: 'January', monthNum: 1 },
              },
              {
                case: { $eq: [{ $month: '$createdAt' }, 2] },
                then: { month: 'February', monthNum: 2 },
              },
              {
                case: { $eq: [{ $month: '$createdAt' }, 3] },
                then: { month: 'March', monthNum: 3 },
              },
              {
                case: { $eq: [{ $month: '$createdAt' }, 4] },
                then: { month: 'April', monthNum: 4 },
              },
              {
                case: { $eq: [{ $month: '$createdAt' }, 5] },
                then: { month: 'May', monthNum: 5 },
              },
              {
                case: { $eq: [{ $month: '$createdAt' }, 6] },
                then: { month: 'June', monthNum: 6 },
              },
              {
                case: { $eq: [{ $month: '$createdAt' }, 7] },
                then: { month: 'July', monthNum: 7 },
              },
              {
                case: { $eq: [{ $month: '$createdAt' }, 8] },
                then: { month: 'August', monthNum: 8 },
              },
              {
                case: { $eq: [{ $month: '$createdAt' }, 9] },
                then: { month: 'September', monthNum: 9 },
              },
              {
                case: { $eq: [{ $month: '$createdAt' }, 10] },
                then: { month: 'October', monthNum: 10 },
              },
              {
                case: { $eq: [{ $month: '$createdAt' }, 11] },
                then: { month: 'November', monthNum: 11 },
              },
              {
                case: { $eq: [{ $month: '$createdAt' }, 12] },
                then: { month: 'December', monthNum: 12 },
              },
            ],
            default: 'Invalid',
          },
        },
        total: { $sum: 1 },
        // transactions: { $addToSet: '$amount' },
        transactions: { $push: '$amount' },
        totalAmount: { $sum: '$amount' },
      },
    },
    { $addFields: { time: '$_id' } },

    {
      $project: { _id: 0 },
    },
    {
      $sort: {
        'time.monthNum': 1,
      },
    },
    { $limit: 12 },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
