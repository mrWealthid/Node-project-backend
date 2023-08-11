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
const User = require('./model/userModel');

const transactionController = require('./controllers/transactionController');
const passport = require('passport')
const session = require('express-session')
const GoogleStrategy = require("passport-google-oauth20").Strategy;


const filepath = path.join(process.cwd(), 'public');
const jwt = require('jsonwebtoken');

const app = express();

// process.env.NODE_ENV = 'production'
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
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: 'Too many Request from this IP, please try again in an hour',
});

// app.use(express.static('public'));
app.use('/api', limiter);



app.post('/payment-checkout', bodyParser.raw({type: 'application/json'}) ,transactionController.paymentCheckout )


// app.post('/walletfunding-checkout', bodyParser.raw({type: 'application/json'}) ,transactionController.fundingCheckout )

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



//Google Authentication

app.use(session({
  secret: process.env.CLIENT_SECRET,
  resave: true,
  saveUninitialized: true,
}));

// Initialize Passport
app.use(passport.initialize());


// Configure Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {

console.log({profile: profile})

  User.findOne({ googleId: profile.id }).then((newUser)=>  {
  if (newUser) {
console.log({foundUser: newUser})

  
    // User already exists, log them in
    return done(null, newUser);
  } else {





    console.log({profile: profile})
    // Create a new user in your MongoDB database
    const newUser = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      photo:profile.photos[0].value

    });
console.log({newUser: newUser})
console.log(newUser.name)


function generateUniqueAccountNumber() {
  let randomDigits;
  let result;
  const timestamp = Date.now().toString().slice(9);
  if (crypto && crypto.getRandomValues) {
    const array = new Uint8Array(7);
    crypto.getRandomValues(array);
    randomDigits = array.join('').slice(0, 7);

    result = Number(timestamp) + Number(randomDigits);
  }

  return result;
}

const payload = {
  name: profile.displayName,
  email: profile.emails[0].value,
  googleId: profile.id,
  accountNumber: generateUniqueAccountNumber()
}



    User.create(payload).then((newUser)=>{
    console.log('User was created')
      console.log('created user', newUser)
      return done(null, newUser);
    })
    
  }
}).catch((err)=> {
console.log(err)
  })

  

}));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});


app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));


  app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    console.log('success', req.user)

    console.log('I was called')

    //If the user is found sign a jwt token
    const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
});
const token =signToken(req.user._id)

    // Successful authentication redirects to the client application with jwt 
    res.redirect(`${process.env.GOOGLE_SUCCESS_URL}?token=${token}`);
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
