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


  
  // const isAdmin = req.user.role === 'admin';
  const stats = await Loan.aggregate([
    {
      $match: {
        user: { $eq: new Types.ObjectId(req.user.id) },
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