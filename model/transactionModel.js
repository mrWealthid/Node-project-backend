const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    initiatorName: {
      type: String,
      required: [true, 'Please tell us your name!'],
    },
    amount: { type: Number, required: [true, 'Please specify amount'] },
    transactionType: {
      type: String,
      enum: ['Debit', 'Credit'],
      required: [true, 'Please specify transaction Type!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must belong to a User.'],
    },

    initiatorAccountNumber: {
      type: Number,
      minlength: 7,
    },
    beneficiaryAccountNumber: {
      type: Number,
      minlength: 7,
    },

    channel: {
      type: String,
      enum: ['Transfer', 'Card'],
      required: [true, 'Please specify transaction Channel!'],
      default:'Transfer'
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);



// transactionSchema.pre(/^find/, function (next) {
//   // this.find({ active: false });
//   this.find({ channel: { $ne: 'Card' } });
//   next();
// });



const Transaction = mongoose.model('Transaction', transactionSchema);

// Transaction.init().then((x) => console.log(x));
module.exports = Transaction;
