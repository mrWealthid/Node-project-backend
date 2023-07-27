const express = require('express');
const transactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

//Protect all route after this middleware
router.use(authController.protect);
router.get('/funding-session/:amount',transactionController.getFundingSession);
router.get('/payment-session/:beneficiaryId/:amount',transactionController.getPaymentSession);

router
  .route('/')
  .get(authController.protect, transactionController.getAllTransactions)
  .post(
    authController.restrictTo('user'),
    transactionController.createTransaction
  );

router
  .route('/:id')
  .get(transactionController.getTransaction)
  .delete(
    authController.restrictTo('admin', 'user'),
    transactionController.deleteTransaction
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    transactionController.updateTransaction
  );

//Stats

router.route('/user/balance').get(transactionController.getUserBalance);

router
  .route('/monthly-stats/:type/:year')
  .get(transactionController.getTransactionMonthlyStats);

router
  .route('/stats/:type/:time')
  .get(transactionController.getTransactionStats);

module.exports = router;
