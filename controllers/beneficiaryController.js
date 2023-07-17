const Beneficiary = require('../model/beneficiaryModel');
const factory = require('./handlerFactory');

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllBeneficiaries = factory.getAll(Beneficiary);
exports.getBeneficiary = factory.getOne(Beneficiary);

//Don't try to update users password using this endpoint even as an admin
exports.updateBeneficiary = factory.updateOne(Beneficiary);
exports.deleteBeneficiary = factory.deleteOne(Beneficiary);
exports.createBeneficiary = factory.createOne(Beneficiary);
