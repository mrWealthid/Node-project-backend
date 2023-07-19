const Loan = require('../model/loanModel');
const factory = require('./handlerFactory');

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllLoans = factory.getAll(Loan);
exports.getLoan = factory.getOne(Loan);

//Don't try to update users password using this endpoint even as an admin
exports.updateLoan = factory.updateOne(Loan);
exports.deleteLoan = factory.deleteOne(Loan);
exports.createLoan = factory.createOne(Loan);
