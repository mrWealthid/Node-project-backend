const express = require('express');
const transactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

//Protect all route after this middleware
router.use(authController.protect);
router
  .route('/')
  .get(transactionController.getAllTransactions)
  .post(
    authController.restrictTo('user'),
    transactionController.setTransUserIds,
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

module.exports = router;
