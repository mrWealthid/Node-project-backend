const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//Factory Function is a function
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError(`No document found with that ID`, 404));
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new AppError(`No document found with that ID`, 404));

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) return new AppError(`No Document found with that ID`, 404);

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });


exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //To allow for nested get review on tour -Hack
    let filter = {};
    let includeAll = true

    // console.log(req.user);
    // if (req.params.tourId) filter = { tour: req.params.tourId };
    if (req.user.id) filter = { user: req.user.id };
    if (req.user.role === 'admin') filter = {};
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    //Execute Query
    // const doc = await features.query.explain();
    const doc = await features.query;
let count;



// console.log( await Model.find(req.query))


  



//I did this because pagination of filtered data was impossible, The endpoint keeps returning the total count of all document

if(Object.values(req.query).length > 0) {
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete req.query[el]);
count = await Model.find(filter).find(req.query).count()
}
else  {
count=  await Model.count(filter)
}


    //Send Response
    res.status(200).json({
      status: 'success',
      totalRecords: count,
      results: doc.length,
      data: doc,
    });
  });
