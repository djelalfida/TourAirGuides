const Guide = require('./../models/guideModel');
// const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllApplications = factory.getAll(Guide);
exports.getApplication = factory.getOne(Guide);
exports.createApplication = factory.createOne(Guide);
exports.updateApplication = factory.updateOne(Guide);
exports.deleteApplication = factory.deleteOne(Guide);
