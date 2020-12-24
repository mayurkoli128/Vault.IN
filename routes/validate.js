const Joi = require('joi');

function validate(user) {
    const schema = Joi.object({
        email: Joi.string().email().max(255).required(),
        password: Joi.string().min(6).max(255).required(),
    });
    return schema.validate(user);
}
exports.validate = validate;
