const express = require("express");
const connectDb = require("./db-connection");
const { logger } = require("./pino");
const cors = require("cors");
const dns = require("dns");
const util = require("util");

function createApp(client) {
  const db = client.db("shorten_url");
  const countCollection = db.collection("count");
  const urlsCollection = db.collection("short_urls");

  const app = express();

  app.use(cors());
  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  app.use("/public", express.static(process.cwd() + "/public"));

  app.get("/", function (req, res) {
    res.sendFile(process.cwd() + "/views/index.html");
  });
  app.get("/api/hello", function (req, res) {
    res.json({ greeting: "hello API" });
  });
  app.get("/api/shorturl/:short_url", async function (req, res, next) {
    try {
      const result = await urlsCollection.findOne({
        short_url: parseInt(req.params.short_url),
      });
      if (result) {
        res.redirect(result.original_url);
        return;
      }
      // spec does not specify case where short url does not yet exist
      res.status(404).send("Sorry can't find that!");
    } catch (err) {
      // errors can come from the findOne or the redirect calls
      next(err);
    }
  });

  app.post("/api/shorturl/new", async function (req, res, next) {
    const ADDRESS_NOT_FOUND = "ENOTFOUND";
    const original_url = req.body.url;
    const lookup = util.promisify(dns.lookup);
    try {
      await lookup(original_url);
      const updateResults = await countCollection.findOneAndUpdate(
        { _id: "short_urls" },
        { $inc: { seq: 1 } },
        { returnOriginal: false }
      );
      const shortened = {
        original_url,
        short_url: updateResults.value.seq,
      };
      await urlsCollection.insertOne(shortened);
      res.json(shortened);
    } catch (err) {
      if (err.code === ADDRESS_NOT_FOUND) {
        res.json({ error: "invalid URL" });
        return;
      }
      // the err passed to next can come from either
      // the lookup, the findAndModify, the insert
      // or res.json
      next(err);
    }
  });
  return app;
}

async function startServer(factory, dbUri, port = process.env.PORT || 3000) {
  const dbClient = await connectDb(logger, dbUri);
  const app = factory(dbClient);
  return {
    dbClient,
    app: app.listen(port, function () {
      logger.info("Node.js listening ...");
    }),
  };
}

module.exports = {
  startServer,
  createApp,
};
