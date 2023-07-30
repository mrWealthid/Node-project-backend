// const catchAsync = require('../utils/catchAsync');
const { Types } = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../model/transactionModel');
const User = require('../model/userModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const crypto = require("crypto")


// exports.setTransUserIds = (req, res, next) => {
//   // if (!req.body.transactionRef) req.body.transactionRef = req.params.transRef;
//   if (!req.body.userId) req.body.userId = req.params.userId;
//   if (!req.body.user) req.body.user = req.user.id;
//   next();
// };


exports.getAllTransactions = factory.getAll(Transaction);
exports.getTransaction = factory.getOne(Transaction);
// exports.createTransaction = catchAsync(async (req, res, next) => {
//   const initiator = req.body.initiatorAccountNumber;
//   const beneficiary = req.body.beneficiaryAccountNumber;

//   if (initiator === beneficiary)
//     return next(new AppError("You can't Transfer to self", 404));
//   const settlement = {
//     ...req.body,

//     amount: req.body.amount * -1,
//     transactionType: 'Debit',
//     user: req.user.id,
//   };

//   const doc = await Transaction.create(req.body);
//   await Transaction.create(settlement);

 

//   res.status(201).json({
//     status: 'success',
//     data: { data: doc },
//   });
// });

exports.deleteTransaction = factory.deleteOne(Transaction);
exports.updateTransaction = factory.updateOne(Transaction);

exports.getTransactionMonthlyStats = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const { type } = req.params;

  const isAdmin = req.user.role === 'admin';

  const stats = await Transaction.aggregate([
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
        transactionType: {
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
        total: { $sum: 1 },
        // transactions: { $addToSet: '$amount' },
        transactions: { $push: '$amount' },
        totalAmount: { $sum: '$amount' },
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

exports.getTransactionStats = catchAsync(async (req, res) => {
  const { time } = req.params;
  const { type } = req.params;

  let startDate;
  let endDate;

  if (type === 'month') {
    startDate = new Date().setMonth(time, 1);
    endDate = new Date().setMonth(time, 30);
  }

  if (type === 'year') {
    startDate = new Date().setFullYear(time, 1);
    endDate = new Date().setFullYear(time, 12);
  }

  const isAdmin = req.user.role === 'admin';

  const stats = await Transaction.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
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
      },
    },

    // {
    //   $group: {
    //     _id: '$transactionType',
    //     // transactions: { $addToSet: '$amount' },
    //     transactions: { $push: '$amount' },
    //     totalAmount: { $sum: '$amount' },
    //   },
    // },

    {
      $group: {
        _id: '$transactionType',
        transactions: { $push: '$amount' },
        totalAmount: { $sum: '$amount' },
      },
    },
    {
      $group: {
        _id: null,
        result: {
          $push: {
            k: '$_id',
            v: {
              transactions: '$transactions',
              totalAmount: '$totalAmount',
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
    data: {
      stats,
    },
  });
});

exports.getUserBalance = catchAsync(async (req, res) => {
  // const isAdmin = req.user.role === 'admin';
  const stats = await Transaction.aggregate([
    {
      $match: {
        user: { $eq: new Types.ObjectId(req.user.id) },
      },
    },
    {
      $group: {
        _id: null,
        transactions: { $push: '$amount' },
        total: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
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



// WEBHOOOKS================================>


///Payment Webhooks

exports.getPaymentSession = catchAsync(async (req, res, next) => {
  const {amount, beneficiaryId} = req.params
  
    //Get currently booked user
    const beneficiary = await User.findById(beneficiaryId);
  
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `https://wealthtech.netlify.app/dashboard/payments`,
   
      cancel_url: `https://wealthtech.netlify.app/dashboard/payments`,
      customer_email: req.user.email,
      client_reference_id: beneficiary.id,
  
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amount* 100,
            product_data: {
              name: `${beneficiary.name}`,
              description: beneficiary.accountNumber,
              images: [beneficiary.imgUrl],
            },
          },
          quantity: 1,
        },
      ],
  
      metadata: {
        source:"Payment"
      }
     
    });
  
    res.status(200).json({
      status: 'success',
      session,
    });
    //Create session as response
  });
  
  exports.paymentCheckout = catchAsync(async(req,res, next)=> {
        const sig = req.headers['stripe-signature'];
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
  
    // Handle the event
    switch (event.type) {

  case 'checkout.session.completed':

        const checkoutSessionCompleted = event.data.object;

        const metadata = event.data.object.metadata;
      


      if (metadata && metadata.source === 'Payment') {
      handlePaymentSessionCompleted(checkoutSessionCompleted)
      } else {
      handleFundingSessionCompleted(checkoutSessionCompleted)
       
      }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  
    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({
      status: 'success',
      mesage: 'Recieved'
    });
  
  
  })
  


  
  async function  handlePaymentSessionCompleted(session) {
  
    const beneficiaryId = session.client_reference_id
    const email = session.customer_details.email
  
  const beneficiary=  await User.findById(beneficiaryId);
  const userDetails=  await User.find({email: email});
  
  

  // const initiator = userDetails.initiatorAccountNumber;
  // const beneficiary = beneficiaryDetails.beneficiaryAccountNumber;
  
  // if (initiator === beneficiary)
  //   return next(new AppError("You can't Transfer to self", 404));
  
  
  
  const payload = {
    initiatorName: userDetails[0].name,
    beneficiaryAccountNumber:beneficiary.accountNumber,
    initiatorAccountNumber:userDetails[0].accountNumber,
    amount: (session.amount_total/100),
    transactionType: 'Credit',
    user: beneficiary.id,
    createdAt:  new Date(Date.now())
  };

  console.log({payload: payload})

  await Transaction.create(payload);
  
  //settlement
  await Transaction.create({...payload, amount: (session.amount_total/100) * -1, transactionType:'Debit',  user: userDetails[0].id});
  
  
  }


///FUNDING WEBHOOKS
  exports.getFundingSession = catchAsync(async (req, res, next) => {
  

    const {amount} = req.params
    
    
      
    
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `https://wealthtech.netlify.app/dashboard/payments`,
     
        cancel_url: `https://wealthtech.netlify.app/dashboard/payments`,
        customer_email: req.user.email,
        client_reference_id: req.user.id,
    
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: amount* 100,
              product_data: {
                name: `${req.user.name}`,
                description: req.user.accountNumber,
                images: [req.user.imgUrl],
              },
            },
            quantity: 1,
          },
        ],


        metadata: {
          source:"Funding"
        }
       
        
      });
    
      res.status(200).json({
        status: 'success',
        session,
      });
      //Create session as response
    });

//     exports.fundingCheckout = catchAsync(async(req,res, next)=> {
//       const sig = req.headers['stripe-signature'];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_FUNDING_SECRET);
//   } catch (err) {
//     res.status(400).send(`Webhook Error: ${err.message}`);
//     return;
//   }

//   // Handle the event
//   switch (event.type) {


// case 'checkout.session.completed':
//       const checkoutSessionCompleted = event.data.object;
//       // Then define and call a function to handle the event checkout.session.completed

//       handleFundingSessionCompleted(checkoutSessionCompleted)
//       break;


//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   // Return a 200 response to acknowledge receipt of the event
//   res.status(200).json({
//     status: 'success',
//     mesage: 'Recieved'
//   });


// })

  async function  handleFundingSessionCompleted(session) {
  
  const user=  await User.findById(session.client_reference_id);
  
  const payload = {
    initiatorName: user.name,
    beneficiaryAccountNumber:user.accountNumber,
    initiatorAccountNumber:user.accountNumber,
    amount: (session.amount_total/100),
    transactionType: 'Credit',
    user: user.id,
    channel:'Card',
    createdAt:  new Date(Date.now())
  };
  
  await Transaction.create(payload);  
  }
