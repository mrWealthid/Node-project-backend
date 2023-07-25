const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../model/userModel');
const Booking = require('../model/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {

const {amount, beneficiaryId} = req.params

console.log(beneficiaryId)


  //Get currently booked user
  const beneficiary = await User.findById(beneficiaryId);

  //Get Checkout Session

  console.log(beneficiary)

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/dashboard/payments`,
 
    cancel_url: `${req.protocol}://${req.get('host')}/dashboard/payments`,
    customer_email: req.user.email,
    client_reference_id: req.user.id,
    mode: 'payment',
    metadata: {beneficiary: beneficiary.name, beneficiaryId: beneficiary.id, initiatorName:req.user.name, initiatorAccountNumber:req.user.accountNumber, transactionType:'Credit'},
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: amount * 100,
          product_data: {
            name: `${beneficiary.name}`,
            description: beneficiary.accountNumber,
            images: [beneficiary.imgUrl],
          },
        },
        quantity: 1,
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    session,
  });
  //Create session as response
});

exports.webhoookCheckout = catchAsync(async(req,res, next)=> {

      const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
createBookingCheckout(paymentIntentSucceeded)
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({
    status: 'success',
    mesage: 'Recieved'
  });


})

async function createBookingCheckout (session)  {

    console.log(session)
    // const initiator = req.body.initiatorAccountNumber;
    // const beneficiary = req.body.beneficiaryAccountNumber;
  
    // if (initiator === beneficiary)
    //   return next(new AppError("You can't Transfer to self", 404));
    // const settlement = {
    //   ...req.body,
  
    //   amount: req.body.amount * -1,
    //   transactionType: 'Debit',
    //   user: req.user.id,
    // };
  
    // const doc = await Transaction.create(req.body);
    // await Transaction.create(settlement);
  
   
  
    // res.status(201).json({
    //   status: 'success',
    //   data: { data: doc },
    // });
}
// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   //THIS IS ONLY TEMPORARY BECAUSE EVERYONE CAN MAKE BOOKINGS WITHOUT PAYING

//   const { user, user, price } = req.query;

//   if (!user && !user && !price) return next();
//   await Booking.create({ user, user, price });

//   res.redirect(req.originalUrl.split('?')[0]);
// });






// server.js
//
// Use this sample code to handle webhook events in your integration.
//
// 1) Paste this code into a new file (server.js)
//
// 2) Install dependencies
//   npm install stripe
//   npm install express
//
// 3) Run the server on http://localhost:4242
//   node server.js

// The library needs to be configured with your account's secret key.
// Ensure the key is kept out of any version control system you might be using.



// This is your Stripe CLI webhook secret for testing your endpoint locally.



exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
