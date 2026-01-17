const mongoose = require('mongoose');
const validator = require('validator');
// Creating the schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 50,
    },
    lastName: {
      type: String,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 6,
      maxlength: 50,
      validate: {
        validator: function (v) {
          if (validator.isEmail(v)) {
            return true;
          }
          return false;
        },
        message: 'Please enter a valid email address',
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 100,
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    photoUrl: {
      type: String,
      default:
        'https://styles.redditmedia.com/t5_3ofkf/styles/communityIcon_hfmjjugpssg71.png?width=48&height=48&frame=1&auto=webp&crop=48%3A48%2Csmart&s=a653766ab03f5c0c3da77b8618e4f3924bc7b369',
      validate: {
        validator: function (v) {
          if (validator.isURL(v)) {
            return true;
          }
          return false;
        },
        message: 'Please enter a valid URL',
      },
    },
    about: {
      type: String,
      default: 'Default about me text',
    },
    skills: {
      type: [String],
      validate: {
        validator: require('../utils/validation').validateSkillsArray,
        message: 'Skills array can have at most 10 items',
      },
    },
  },
  // Adds createdAt and updatedAt fields
  { timestamps: true }
);

// Creating the model
module.exports = mongoose.model('User', userSchema);
