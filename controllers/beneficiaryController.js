const Beneficiary = require('../model/beneficiaryModel');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllBeneficiaries = factory.getAll(Beneficiary);
exports.getBeneficiary = factory.getOne(Beneficiary);

//Don't try to update users password using this endpoint even as an admin
exports.updateBeneficiary = factory.updateOne(Beneficiary);
exports.deleteBeneficiary = factory.deleteOne(Beneficiary);
exports.createBeneficiary = catchAsync(async (req, res, next) => {

const beneficiaries =  await Beneficiary.find({user:req.user.id})

const foundBeneficiary =beneficiaries.find((user)=> user.accountNumber === req.body.accountNumber)

if(!foundBeneficiary)  {
  const doc = await Beneficiary.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { data: doc },
  })}
});
