const express = require('express');
const multer = require('multer');
const authController = require('../controllers/authController');
const transactionRouter = require('./transactionRoutes');

const {
  getUser,
  getAllUsers,

  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
  accountLookup,
} = require('../controllers/userController');

const router = express.Router();

router.use('/:userId/transactions', transactionRouter);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//Protect all route after this middleware
router.use(authController.protect);
router.patch('/updatePassword', authController.updatePassword);
router.get('/me', getMe, getUser);
router.get('/lookup', accountLookup);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);

//Protect all this route to only admins
router.use(authController.restrictTo('admin'));
router.route('/').get(getAllUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
module.exports = router;
