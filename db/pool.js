var mongoose = require('mongoose');
const mongoURI = require('../config/monkoKEY');
var mainPool = mongoose.createConnection(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
});
var app = mainPool.useDb('app');

module.exports = {
    app: () => app
};