var mongoose = require('mongoose');

function connectDb (logger, dbUri = process.env.DB_URI) {
    return mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(function () {
            logger.info("DB connected successfully.");
        })
        .catch(function (error) {
            logger.fatal(error, "DB failed to connect.");
            throw(error);
        });
}

module.exports = connectDb;