'use strict';

var express = require('express');
// var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');
var { logger } = require('./pino');

var app = express();

var port = process.env.PORT || 3000;

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

const appServer = app.listen(port, function () {
  console.log('Node.js listening ...');
});

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(function () {
    logger.info("DB connected successfully.");
  })
  .catch(function (error) {
    logger.fatal(error, "DB failed to connect.");
    appServer.close();
  });

module.exports = {
  appServer,
  mongoose
};