const validator = require('validator');

const validateSignupData = (req) => {
  const errors = [];
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName) {
    errors.push('Name is not valid');
  }
  if (!validator.isEmail(email)) {
    errors.push('Email is not valid');
  }
  // Relaxed password requirements
  const passwordOptions = {
    minLength: 6,
    minLowercase: 1,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  };
  if (!validator.isStrongPassword(password, passwordOptions)) {
    errors.push('Password is not strong enough');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

function validateSkillsArray(arr) {
  return arr.length <= 10;
}

const validateEditProfileData = (req) => {
  const allowedUpdates = [
    'firstName',
    'lastName',
    'age',
    'photoUrl',
    'about',
    'gender',
    'skills',
  ];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    throw new Error('Invalid updates!');
  }
};

module.exports = {
  validateSignupData,
  validateSkillsArray,
  validateEditProfileData,
};
