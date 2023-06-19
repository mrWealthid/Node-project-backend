const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour must have less than or equal than 40 characters'],
      minlength: [10, 'A tour must have more or equal than 10 characters']
      //validate: [validator.isApha, 'Tour name should only be letters'],
    },
    slug: String,

    ratingsQuantity: { type: Number, default: 0 },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'Rating must be below 5.0'],
      min: [1, 'Rating must be above 1.0'],
      set: (val) => Math.round(val * 10) / 10
    },
    duration: { type: Number, required: [true, 'A tour must have a duration'] },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty level'],
      enum: {
        values: ['easy', 'difficult', 'medium'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    priceDiscount: {
      type: Number,
      validate: {
        message:
          'Discount price {{VALUE}} should be lesser  than the regular price',
        validator: function(val) {
          //This won't work on update-- only works on new document creation

          return val < this.price; //price discount should always be lower
        }
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },

    price: { type: Number, required: [true, 'A tour must have a price'] },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },

    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    secretTour: { type: Boolean, default: false },
    startDates: [Date],
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }]
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//Indexing for better performance-SINGLE INDEX
// tourSchema.index({ price: 1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

//Compound Index
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

//Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'

});

////DOCUMENT MIDDLEWARE: runs before .save() and .create() not on .insertMany
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//This has it's limitations- when the user role can easily be changed!
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', (next) => {
//   console.log('will save document');
//   next();
// });
//
// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

///Query Middleware
tourSchema.pre(/^find/, function(next) {
  // tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} millisecondsc`);
  next();
});
////Aggregation Middleware

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

//Four types of middleware in Mongoose; document, query, aggregate and model
