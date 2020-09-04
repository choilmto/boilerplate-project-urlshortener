const express = require('express');
// var mongo = require('mongodb');
const connectDb = require('./db-connection');
const { logger } = require('./pino');
const cors = require('cors');

function createApp() {
  const app = express();

  app.use(cors());

  /** this project needs to parse POST bodies **/
  // you should mount the body-parser here

  app.use('/public', express.static(process.cwd() + '/public'));

  app.get('/', function(req, res){
    res.sendFile(process.cwd() + '/views/index.html');
  });

  app.get("/api/hello", function (req, res) {
    res.json({greeting: 'hello API'});
  });

  return app;
}

function startServer(factory, dbUri, port = process.env.PORT || 3000) {
  const app = factory();
  return connectDb(logger, dbUri)
    .then(() => {
      return app.listen(port, function () {
        logger.info('Node.js listening ...');
      });
    });
}

module.exports = {
  startServer,
  createApp
};