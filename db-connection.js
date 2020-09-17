var mongoose = require('mongoose');

function connectDb(logger, dbUri = process.env.DB_URI) {
    return mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(function () {
            logger.info("DB connected successfully.");
        });
}

module.exports = connectDb;