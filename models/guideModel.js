const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');


const guideSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Provide a name please']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  },
  birthdate: {
    type: Date,
    required: [true, 'Provide your birthdate']
  },
  address: {
    type: String,
    required: [true, 'Provide your address']
  },
  zip: {
    type: Number,
    required: [true, 'Provide your zip code']
  },
  city: {
    type: String,
    required: [true, 'Please your city']
  },
  aboutGuide: {
    type: String,
    required: [true, 'Please tell us about yourself']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  response: {
    type: String,
    default: 'No specific comment'
  },
  stage: {
    type: String,
    enum: {
      values: ['sent', 'awaiting for approval', 'approved', 'not approved'],
      message: 'Values are sent, awaiting for approval, approved, not approved'
    },
    default: 'sent'
  }
});

guideSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'email '
  });
  next();
});

const Guide = mongoose.model('Guide', guideSchema);

module.exports = Guide;
