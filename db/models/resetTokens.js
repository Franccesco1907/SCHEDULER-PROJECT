const mongoose = require('mongoose');
const db = require('../pool').app();

const resetTokens = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        default: () => Date.now(),
    },
    // will automatically delete after 10 min
    // can be a bit delay, because the bg thread runs every 60 sec // 600 * 24 = 24 horas
    expire_at: { type: Date, default: Date.now, expires: 14400 }
});

module.exports = db.model('resetTokens', resetTokens);