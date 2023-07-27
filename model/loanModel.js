const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
    },
    amount: { type: Number, required: [true, 'Please specify amount'] },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Loan request must belong to a User.'],
    },

    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'DECLINED'],
      default: 'PENDING',
    },

    rate: {
      type: Number,
      default: 1.5,
    },
    duration: {
      type: Number,
      required: [true, 'Loan request must have a payable duration.'],
    },
    accountNumber: {
      type: Number,
      minlength: 7,
    },

    requestDate: {
      type: Date,
      default: Date.now(),
    },

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PAID'],
      default: 'UNPAID',
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

loanSchema.virtual('dueDate').get(function () {
  const loanMonth = new Date(this.requestDate).getMonth();

  return new Date(
    new Date(this.requestDate).setMonth(loanMonth + this.duration)
  ).toISOString();
});

const Loan = mongoose.model('Loan', loanSchema);

// Transaction.init().then((x) => console.log(x));
module.exports = Loan;
