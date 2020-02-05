const express = require('express');
const guideController = require('./../controllers/guideController');
const authController = require('./../controllers/authController');

const router = express.Router({
  mergeParams: true
});

router.use(authController.protect);

router
  .route('/')
  .get(guideController.getAllApplications)
  .post(guideController.setTourUserIds, guideController.createApplication);

router
  .route('/:id')
  .get(guideController.getApplication)
  .patch(
    authController.restrictTo('user', 'admin'),
    guideController.updateApplication
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    guideController.deleteApplication
  );

module.exports = router;
