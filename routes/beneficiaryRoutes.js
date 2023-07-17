const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');
const beneficiaryController = require('../controllers/beneficiaryController');

router.use(authController.protect);
router
  .route('/')
  .get(authController.protect, beneficiaryController.getAllBeneficiaries)
  .post(
    authController.restrictTo('user'),
    beneficiaryController.createBeneficiary
  );

router
  .route('/:id')
  .get(beneficiaryController.getBeneficiary)
  .delete(
    authController.restrictTo('user'),
    beneficiaryController.deleteBeneficiary
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    beneficiaryController.updateBeneficiary
  );

module.exports = router;
