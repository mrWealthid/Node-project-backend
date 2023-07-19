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

const filepath = path.join(process.cwd(), 'public');

const app = express();

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

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
