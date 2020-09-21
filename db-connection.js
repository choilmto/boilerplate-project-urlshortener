const { MongoClient } = require("mongodb");

function connectDb(logger, dbUri = process.env.DB_URI) {
  const client = new MongoClient(dbUri);
  return client.connect().then(() => {
    logger.info("DB connected successfully.");
    return client;
  });
}

module.exports = connectDb;
