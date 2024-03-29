const Joi = require("joi");

const registerVaildation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(6).max(50).required().email(),
    password: Joi.string().min(6).max(255).required(),
    role: Joi.string().required().valid("student", "instructor"),
  });

  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(50).required().email(),
    password: Joi.string().min(6).max(255).required(),
  });

  return schema.validate(data);
};

const passwordValidation = (data) => {
  const schema = Joi.object({
    password: Joi.string().min(6).max(255).required(),
    newPassword1: Joi.string().min(6).max(255).required(),
    newPassword2: Joi.string().min(6).max(255).required(),
  });

  return schema.validate(data);
};

const emailValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(50).required().email()
  });

  return schema.validate(data);
};

const resetPasswordValidation = (data) => {
  const schema = Joi.object({
    password: Joi.string().min(6).max(255).required(),
  });

  return schema.validate(data);
};

const courseVaildation = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(6).max(50).required(),
    description: Joi.string().min(6).max(50).required(),
    price: Joi.number().min(10).max(9999).required(),
  });

  return schema.validate(data);
};

module.exports.registerVaildation = registerVaildation;
module.exports.loginValidation = loginValidation;
module.exports.passwordValidation = passwordValidation;
module.exports.emailValidation = emailValidation;
module.exports.resetPasswordValidation = resetPasswordValidation;
module.exports.courseVaildation = courseVaildation;
