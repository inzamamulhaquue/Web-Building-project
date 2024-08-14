const Joi = require('joi');
const { ObjectId } = require('mongoose').Types;

/**
 * validating options for Joi
 */
const options = {
    abortEarly: false,
};

const email = (value, helpers) => {
    const domain = value.split('@');
    if (domain[1] === `yopmail.com`) {
        return helpers.error('any.invalid');
    }
    return value;
};

const passwordSchema = Joi.string()
    .empty()
    .required()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, {
        name: 'required',
    })
    .message(
        `Enter a password with minimum one upper case, lower case and number, ranging from 8-15 characters`,
    )
    .min(8)
    .max(15)
    .messages({
        'string.base': `Enter a password with minimum one upper case, lower case and number, ranging from 8-15 characters`,
        'string.empty': `Password is required`,
        'string.min': `Password must have a minimum of {#limit} characters`,
        'string.max': `Password can have a maximum of {#limit} characters`,
        'any.required': `Password is required`,
    });
const firstNameSchema = Joi.string()
    .empty()
    .max(150)
    .messages({
        'string.base': `First Name must be a type of string`,
        'string.empty': `First Name is required `,
        'string.max': `First Name can have maximum  of {#limit} characters`,
        'any.required': `First Name is required `,
        'any.optional': `First Name is optional `,
    });

const lastNameSchema = Joi.string()
    .empty()
    .max(150)
    .messages({
        'string.base': `Last Name must be a type of string`,
        'string.empty': `Last Name is required `,
        'string.max': `Last Name can have maximum  of {#limit} characters`,
        'any.required': `Last Name is required `,
        'any.optional': `Last Name is optional `,
    });

const emailSchema = Joi.string()
    .empty()
    .custom(email, 'custom validation')
    .message('Invalid Email')
    .email({ tlds: { allow: true } })
    .max(256)
    .required()
    .messages({
        'string.base': `Enter your email address in format: yourname@example.com`,
        'string.email': `Enter your email address in format: yourname@example.com`,
        'string.empty': `Email is required`,
        'string.min': `Email must have minimum of {#limit} characters`,
        'string.max': `Email can have maximum of {#limit} characters`,
        'any.required': `Email is required`,
        'any.invalid': `Invalid Email`,
    });

const emailPasswordSchema = Joi.object()
    .keys({
        // name: nameSchema.required(),
        email: emailSchema,
        password: passwordSchema,
    })
    .unknown(true);

const emailVerifySchema = Joi.object().keys({
    code: Joi.string().empty().messages({
        'string.base': `code must be a type of string`,
        'string.empty': `code is required`,
        'string.min': `code must have minimum of {#limit} characters`,
        'string.max': `code can have maximum  of {#limit} characters`,
        'any.required': `code is required`,
        'any.optional': `code is optional`,
    }),
});

const emailVerify = Joi.object().keys({
    email: emailSchema,
});


const loginSchema = Joi.object()
    .keys({
        email: emailSchema,
        // password: passwordSchema,
    })
    .unknown(true);

const GoogleSchema = Joi.object().keys({
    tokenId: Joi.string().empty().required().messages({
        'string.base': `token must be a type of string`,
        'string.empty': `token is required `,
        'string.min': `token must have minimum of {#limit} characters`,
        'string.max': `token can have maximum  of {#limit} characters`,
        'any.required': `token is required `,
        'any.optional': `token is optional `,
    }),
    accessToken: Joi.string().empty().required().messages({
        'string.base': `token must be a type of string`,
        'string.empty': `token is required `,
        'string.min': `token must have minimum of {#limit} characters`,
        'string.max': `token can have maximum  of {#limit} characters`,
        'any.required': `token is required `,
        'any.optional': `token is optional `,
    }),
});

const updateUserProfileSchema = Joi.object().keys({
    firstName: firstNameSchema.required(),
    lastName: lastNameSchema.required(),
    company:  Joi.string().optional(),
    type:  Joi.string().required(),
    mobile:  Joi.number().required(),
    secondaryEmailId: Joi.string().optional(), 
    city: Joi.string().required(),
});

const changePasswordSchema = Joi.object().keys({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
  });
  

// Function




const registerWithEmailAndPassword = (data) => {
    return emailPasswordSchema.validate(data, options);
};
const tokenVerification = (data) => {
    return emailVerifySchema.validate(data, options);
};
const emailVerification = (data) => {
    return emailVerify.validate(data, options);
};
const login = (data) => {
    return loginSchema.validate(data, options);
};
const google = (data) => {
    return GoogleSchema.validate(data, options);
};

const updateUserProfile = (data) => {
    return updateUserProfileSchema.validate(data, options);
};
const validateChangePassword = (data) => {
    return changePasswordSchema.validate(data, options);
  };


module.exports = {
    registerWithEmailAndPassword,
    tokenVerification,
    emailVerification,
    login,
    google,
    updateUserProfile,
    validateChangePassword
}