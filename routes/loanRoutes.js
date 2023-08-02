const express = require('express');
const loanController = require('../controllers/loanController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

//Protect all route after this middleware
router.use(authController.protect);
router
  .route('/')
  .get(authController.protect, loanController.getAllLoans)
  .post(authController.restrictTo('user'), loanController.createLoan);

router
  .route('/:id')
  .get(loanController.getLoan)
  .delete(authController.restrictTo('admin', 'user'), loanController.deleteLoan)
  .patch(authController.restrictTo( 'admin'), loanController.updateLoan);

//Stats

// router.route('/user/balance').get(loanController.getUserBalance);
//
// router
//   .route('/monthly-stats/:type/:year')
//   .get(loanController.getLoanMonthlyStats);
//
// router.route('/stats/:type/:time').get(loanController.getLoanStats);

module.exports = router;
