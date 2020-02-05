const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();
//alerts
router.use(viewsController.alerts);

router.get(
  '/invoice/:bookingId',
  authController.isLoggedIn,
  viewsController.getInvoice
);

router.get('/verify/:token/:email', authController.verify);

//   authController.verify,
//  viewsController.verifyUserMail

router.get(
  '/profile/:id',
  authController.isLoggedIn,
  viewsController.getProfileUser
);

router.get(
  '/profiles',
  authController.allUsers,
  viewsController.getAllUsersPage
);

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', viewsController.getSignUpForm);
router.get(
  '/user-manager',
  authController.allUsers,
  authController.isLoggedIn,
  authController.protect,
  viewsController.getUserManager
);

router.get(
  '/tour-manager',
  authController.allUsers,
  authController.isLoggedIn,
  authController.protect,
  viewsController.addTour
);

router.get('/me', authController.isLoggedIn, viewsController.getAccount);
router.get('/guide', authController.isLoggedIn, viewsController.getGuide);

router.get('/my-tours', authController.protect, viewsController.getMyTours);
router.get('/reviews', authController.protect, viewsController.reviewWrite);

router.get(
  '/sentApplications',
  authController.protect,
  viewsController.guideSent
);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
