const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const slugify = require('slugify');

const transactionSchema = new mongoose.Schema(
  {
    depositorName: {
      type: String,
      required: [true, 'Please tell us your name!'],
    },
    amount: { type: Number, required: [true, 'Please specify amount'] },
    transactionType: {
      type: String,
      enum: ['debit', 'credit'],
      required: [true, 'Please specify transaction Type!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must belong to a User.'],
    },

    // email: {
    //   type: String,
    //   required: [true, 'Please provide your emails'],
    //   unique: true,
    //   lowercase: true,
    //   validate: [validator.isEmail, 'Please provide a valid emails']
    // },
    // photo: { type: String, default: 'default.jpg' },
    // role: {
    //   type: String,
    //   enum: ['user', 'guide', 'lead-guide', 'admin'],
    //   default: 'user'
    // },

    // password: {
    //   type: String,
    //   required: [true, 'Please provide a password'],
    //   minlength: 8,
    //   select: false
    // },

    depositorAccountNumber: {
      type: Number,
      minlength: 7,
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
