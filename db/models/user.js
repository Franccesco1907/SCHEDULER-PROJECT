const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    username: {
        type: String,
        required: false,
    },
    code: Number,
    email: {
        type: String,
        required: true,
    },
    phone: Number,
    password: {
        type: String,
    },
    docType: String,
    docNumber: Number,
    gender: String,
    googleId: {
        type: String,
    },
    provider: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean
    },
    //photo: String
});

module.exports = mongoose.model('user', userSchema);