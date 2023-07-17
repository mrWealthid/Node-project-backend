const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please tell us your name!'] },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Beneficiary must belong to a User!'],
  },

  accountNumber: {
    type: Number,
    minlength: 7,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
const Beneficiary = mongoose.model('Beneficiary', beneficiarySchema);
module.exports = Beneficiary;
