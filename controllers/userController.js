const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const { Types } = require('mongoose');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //user-7675748488se-33444444.jpeg
//     const ext = file.mimetype.split('/').at(1);
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  //This is to permit only images for this project-- Bear in mind this will work for all kind of Images
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

//Don't try to update users password using this endpoint even as an admin
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
// exports.createUser = factory.createOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
  //1 Create Error if user sends password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password Update. Please use /updatePassword',
        400
      )
    );
  }

  //2 filtered out unwanted fields that users should not update
  const filterBody = filterObj(req.body, 'name', 'email');
  if (req.file) filterBody.photo = req.file.filename;

  //3 Update User document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  //3 Update User document
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.accountLookup = catchAsync(async (req, res, next) => {
  const { query } = req;
  const doc = await User.find(query);

  if (doc.length < 1) {
    return next(new AppError('Failed, User not found!', 404));
  }
  res.status(200).json({
    status: 'success',
    data: doc,
  });
});



//User stats  



exports.getUserInsight = catchAsync(async (req, res) => {


  const stats = await User.aggregate([

    {
      $group: {
        _id: '$role',
        totalCount:{ $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        result: {
          $push: {
            k: '$_id',
            v: {
              role: '$role',
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
    // { $addFields: { type: '$_id' } },

    // {
    //   $project: { _id: 0 },
    // },

    { $limit: 12 },
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
    
  });
});



exports.getUserMonthlyStats = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const { type } = req.params;

  const isAdmin = req.user.role === 'admin';

  const stats = await User.aggregate([
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
        role: {
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