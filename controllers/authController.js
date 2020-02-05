const crypto = require('crypto');
const randomstring = require('randomstring');
const {
  promisify
} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const Guide = require('./../models/guideModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = id => {
  return jwt.sign({
      id
    },
    process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true, // only https is
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });
  // Remove password form sign up output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user
    }
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();

  const token = newUser.createEmailToken();
  newUser.updateOne({
    verifyEmailToken: token
  });
  await newUser.save({
    validateBeforeSave: false
  });

  const tokenURL = `${req.protocol}://${req.get('host')}/verify/${token}/${
    newUser.email
  }`;

  await new Email(newUser, tokenURL).sendVerify();

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const {
    email,
    password
  } = req.body;

  // 1) Check if email and passord exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // 2) Check if user exits && password is correct

  const user = await User.findOne({
    email
  }).select('+password +verified');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (user.verified === false) {
    return next(
      new AppError(`Please verify your email address: ${email}`, 401)
    );
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({
    status: 'success'
  });
};

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER

      res.locals.user = currentUser;

      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.allUsers = async (req, res, next) => {
  // THERE IS A LOGGED IN USER

  const allUsers = await User.find();
  res.locals.allUsers = allUsers;

  next();
};

// exports.getSentApplications = async (req, res, next) => {
//   const sent = await Guide.find({
//     user: req.body.user
//   });

//   res.status(200).render('allTours', {
//     title: 'All Tours'
//   });

//   next();
// };

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // Grant access to protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({
    email: req.body.email
  });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({
    validateBeforeSave: false
  });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({
      validateBeforeSave: false
    });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on the token and
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now()
    }
  });

  // 2) if token has not expired, and there is user, set the new passwordConfirm
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  // 3) update changedPasswordAt property for the user with

  // 4) log the user in, send JWT to the client
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) check if posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findbyidandupdate will not work as intended

  // 4) log the user in, send JWT
  createSendToken(user, 200, req, res);
});

// Email verifications

// exports.sendVerify = catchAsync(async (req, res, next) => {
//   const user = await User.findOne({ email: req.body.email });

//   const token = user.createEmailToken();
//   user.updateOne({ verifyEmailToken: token });
//   await user.save({ validateBeforeSave: false });

//   const tokenURL = `http://127.0.0.1:1337/api/v1/users/verify/${token}/${user.email}`;

//   await new Email(user, tokenURL).sendVerify();
//   res.status(200).json({
//     status: 'success',
//     message: 'Token was sent to email'
//   });
// });

exports.verify = catchAsync(async (req, res, next) => {
  // 1) get user based on the token and
  // const hashedToken = req.params.token;
  const {
    email
  } = req.params;

  const user = await User.findOne({
    email
  });

  // 2) if token has not expired, and there is user, set the new passwordConfirm
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.verified = true;
  user.verifyEmailToken = undefined;
  await user.save({
    validateBeforeSave: false
  });
  // 3) update changedPasswordAt property for the user with
  res.redirect(`/?alert=verified&email=${user.name.split(' ')[0]}`);
  // 4) log the user in, send JWT to the client
  createSendToken(user, 200, req, res);
});