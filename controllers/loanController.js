const Loan = require('../model/loanModel');
const Transaction = require('../model/transactionModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

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
