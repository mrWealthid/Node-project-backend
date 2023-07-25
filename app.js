const express = require('express');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/userRoutes');
const transactionRouter = require('./routes/transactionRoutes');
const beneficiaryRouter = require('./routes/beneficiaryRoutes');
const loanRouter = require('./routes/loanRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');

const filepath = path.join(process.cwd(), 'public');

const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

//To trust proxies
// app.enable('trust proxy');

console.log(process.env.NODE_ENV);

////1) GLOBAL MIDDLEWARES4

//SET Security HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(cors());
//Access-Control-Allow-Origin *
//api.natours.com, front-end natours.com
//app.use(cors({
//origin: 'https://www.natours.com'
//})

//For complex requests with preflight; such as delete or put
app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

//Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many Request from this IP, please try again in an hour',
});

// app.use(express.static('public'));
app.use('/api', limiter);



app.post('/webhook-checkout', bodyParser.raw({type: 'application/json'}) ,bookingController.webhoookCheckout )

//Body Parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data Sanitization against XSS
app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
//Serving Static Files
app.use(express.static(filepath));

app.use(compression());

//Test Middlewares
app.use((req, res, next) => {
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/transactions', transactionRouter);
app.use('/api/v1/beneficiaries', beneficiaryRouter);
app.use('/api/v1/loans', loanRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server!`, 404));
});


const endpointSecret = "whsec_94a13cc381bcd2e2861af09a4043edae4f97c95421d0d3de595f8e981b724ac4";

// app.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
//   const sig = request.headers['stripe-signature'];

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
//   } catch (err) {
//     response.status(400).send(`Webhook Error: ${err.message}`);
//     return;
//   }

//   // Handle the event
//   switch (event.type) {
//     case 'payment_intent.succeeded':
//       const paymentIntentSucceeded = event.data.object;
//       // Then define and call a function to handle the event payment_intent.succeeded
//       break;
//     // ... handle other event types
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   // Return a 200 response to acknowledge receipt of the event
//   res.status(200).json({
//     status: 'success',
//     mesage:"Webhook Trigeered"
//   });
// });


app.use(globalErrorHandler);
module.exports = app;
