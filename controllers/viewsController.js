const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Review = require('./../models/reviewModel');
const Guide = require('./../models/guideModel');

exports.alerts = (req, res, next) => {
  const {
    alert
  } = req.query;
  if (alert === 'booking') {
    res.locals.alert =
      'Your booking was successful! Please check your email for a confirmation. If your booking doesnt show up here immedialy, please come back later';
  }
  if (alert === 'delete') {
    res.locals.alert = 'Your account has been successfully deleted';
  }
  if (alert === 'verified') {
    res.locals.alert = `Congratulations ${req.query.email}, your account has been successfully verified!`;
  }

  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template
  // 3) Render that template using tour data from 1

  res.status(200).render('allTours', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) get the data, for the requested tour(reviews and guides)
  const tour = await Tour.findOne({
    slug: req.params.slug
  }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  // 2) Build template

  // 3) Render template

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

// exports.getInvoice = (req, res) => {
//   res.status(200).render('invoice', {
//     title: 'Invoice'
//   });
// };

exports.getProfile = (req, res) => {
  res.status(200).render('profile', {
    title: 'Profile community'
  });
};

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login into your account'
  });
};

exports.getSignUpForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Create your account'
  });
};

exports.getUserManager = (req, res) => {
  res.status(200).render('userManager', {
    title: 'User manager'
  });
};

exports.getAllUsersPage = (req, res) => {
  res.status(200).render('overviewUsers', {
    title: 'All users'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.addTour = (req, res) => {
  res.status(200).render('addTour', {
    title: 'Tour manager'
  });
};

exports.sentApplications = (req, res) => {
  res.status(200).render('sentApplications', {
    title: 'Tour manager'
  });
};

exports.getGuide = (req, res) => {
  res.status(200).render('guide', {
    title: 'Become a guide'
  });
};

exports.getInvoice = catchAsync(async (req, res, next) => {
  const bookings = await Booking.findById(req.params.bookingId);

  res.status(200).render('invoice', {
    title: 'Your invoice',
    bookings
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) find all booking tickets
  const bookings = await Booking.find({
    user: req.user.id
  });

  // 2) find tours with returned ids
  // loop and get the tourID array
  const tourIDs = bookings.map(el => el.tour);
  // going to select all tours which have a tour id which is in the tourids array 'IN OPERATOR'
  const tours = await Tour.find({
    _id: {
      $in: tourIDs
    }
  });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
    bookings
  });
});

exports.guideSent = catchAsync(async (req, res, next) => {
  // 1) find all booking tickets
  const applications = await Guide.find({
    user: req.user.id
  });

  res.status(200).render('sentApplications', {
    title: 'Sent Applications',
    applications
  });
});

// exports.sentApplications = catchAsync(async (req, res, next) => {
//   // const sent = await Guide.find({
//   //   user: '5d9374529d66a917d0ee3522'
//   // });

//   res.status(200).render('sentApplications', {
//     title: 'Applications sent!'
//   });
//   next();
// });

exports.updateUserData = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id, {
      name: req.body.name,
      email: req.body.email
    }, {
      new: true, // Create new
      runValidators: true // valdiation like email correctly
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: user
  });
});

exports.verifyUserMail = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    email: req.params.email
  });
  res.status(200).render('verify', {
    title: 'Email verification',
    user: user
  });
});

exports.getProfileUser = catchAsync(async (req, res, next) => {
  const profile = await User.findById(req.params.id);
  const bookingNum = await Booking.find({
    user: req.params.id
  });
  const aantalBooking = bookingNum.length;
  if (!profile) {
    return next(new AppError('The user with that ID has not been found', 404));
  }
  res.status(200).render('profile', {
    title: `Profile of ${profile.name.split(' ')[0]}`,
    profile,
    aantalBooking
  });
});

exports.reviewWrite = catchAsync(async (req, res, next) => {
  // 1) find all booking tickets
  const bookings = await Booking.find({
    user: req.user.id,
    review: {
      $ne: true
    }
  });

  const user = await User.findById(req.user.id);

  const tourIDs = bookings.map(el => el.tour);

  const tours = await Tour.find({
    _id: {
      $in: tourIDs
    }
  });

  res.status(200).render('review', {
    title: 'My reviews',
    tours,
    bookings,
    user
  });
});