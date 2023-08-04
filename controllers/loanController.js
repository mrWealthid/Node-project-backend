const Loan = require('../model/loanModel');
const Transaction = require('../model/transactionModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const { Types } = require('mongoose');

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllLoans = factory.getAll(Loan);
exports.getLoan = factory.getOne(Loan);


exports.updateLoan = catchAsync(async (req, res, next) => {
  const doc = await Loan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) return next(new AppError(`No document found with that ID`, 404));

const loanRequest = await Loan.findById(req.params.id)

const payload = {
    initiatorName: "WalletLoan",
    amount: loanRequest.amount,
    transactionType: "Credit",
    user: loanRequest.user,
    initiatorAccountNumber:4242424,
    beneficiaryAccountNumber: loanRequest.accountNumber
}
if(req.body.status === "APPROVED") await Transaction.create(payload)

  res.status(201).json({
    status: 'success',
    message: /APPROVED/.test(req.body.status)? 'Loan Request Approved':'Loan Request Declined',
    data: doc
  })});
exports.deleteLoan = factory.deleteOne(Loan);
exports.createLoan = factory.createOne(Loan);


exports.getLoanStats = catchAsync(async (req, res) => {


  
  const isAdmin = req.user.role === 'admin';
  const stats = await Loan.aggregate([
    {
      $match: {
        $or: [
          {
            $and: [{ user: { $eq: new Types.ObjectId(req.user.id) } }],
          },
          {
            $expr: {
              $eq: [isAdmin, true],
            },
          },
        ],
      },
    },
    {
      $group: {
        _id: '$status',
        totalCount:{ $sum: 1 },
        // name: '$_id'
      },
    },

    {
      $group: {
        _id: null,
        result: {
          $push: {
            k: '$_id',
            v: {
              status: '$transactions',
              totalCount: '$totalCount',
            },
          },
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: { $arrayToObject: '$result' },
      },
    },


    // {
    //   $group: {
    //     // _id: '$difficulty',
    //     _id: { $toUpper: '$difficulty' },
    //     // _id: '$ratingAverage',
    //     numTours: { $sum: 1 },
    //     numRatings: { $sum: '$ratingQuantity' },
    //     avgRating: { $avg: '$ratingAverage' },
    //     avgPrice: { $avg: '$price' },
    //     minPrice: { $min: '$price' },
    //     maxPrice: { $max: '$price' },
    //   },
    // },
   

  

     {
      $project: {
        _id: 0,
  
      },
    },

    { $limit: 12 },
  ]);

  res.status(200).json({
    status: 'success',
    data: stats
  });
});

exports.getLoanMonthlyStats = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const { type } = req.params;

  const isAdmin = req.user.role === 'admin';

  const stats = await Loan.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },

        $or: [
          {
            $and: [{ user: { $eq: new Types.ObjectId(req.user.id) } }],
          },
          {
            $expr: {
              $eq: [isAdmin, true],
            },
          },
        ],
        status: {
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
        totalCount: { $sum: 1 },
        // transactions: { $addToSet: '$amount' },
        users: { $push: '$name' },
      
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



