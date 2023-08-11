// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const passport = require("passport")
// const User = require('./model/userModel')

// // ... (your existing code)

// // Configure Google Strategy
// passport.use(new GoogleStrategy({
//   clientID: process.env.CLIENT_ID,
//   clientSecret: process.env.CLIENT_SECRET,
//   callbackURL: 'http://localhost:3000/auth/google/callback',
// }, (accessToken, refreshToken, profile, done) => {
//   // Check if the user already exists in your MongoDB database
//   User.findOne({ 'google.id': profile.id }, (err, user) => {
//     if (err) return done(err);

//     if (user) {
//       // User already exists, log them in
//       return done(null, user);
//     } else {
//       // Create a new user in your MongoDB database
//       const newUser = new User({
//         googleId: profile.id,
//         name: profile.displayName,
//         email: profile.emails[0].value,
//       });
//      newUser.save((err) => {
//         if (err) return done(err);
//         return done(null, newUser);
//       });
//     }
//   });
// }));
