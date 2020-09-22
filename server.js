"use strict";
const { logger } = require("./pino");
const { createApp, startServer } = require("./app");

startServer(createApp).catch((err) =>
  logger.fatal(err, "Server crash as db failed to connect.")
);

setInterval(function () { }, 60000);