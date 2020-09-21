const { createApp, startServer } = require("./app");
const supertest = require("supertest");

// MONGO_URL is provided by @shelf/jest-mongodb
const dbUri = process.env.MONGO_URL;
const port = 0;
let request;
let app;
let dbClient;

beforeAll(async () => {
  ({ app, dbClient } = await startServer(createApp, dbUri, port));
  request = supertest(app);

  // seed count db to start sequencing of short urls at 0
  const countCollection = dbClient.db("shorten_url").collection("count");
  await countCollection.insertOne({
    _id: "short_urls",
    seq: 0,
  });
});

afterAll(() => {
  return Promise.all([dbClient.close(), app.close()]);
});

describe("GET", () => {
  test("/api/hello", async () => {
    const response = await request
      .get("/api/hello")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.greeting).toBe("hello API");
  });
});

describe("Adding urls", () => {
  test("for url that passes dns lookup.", async () => {
    const url = "www.google.ca";
    const response = await request
      .post("/api/shorturl/new")
      .send(`url=${url}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.original_url).toBe(url);
    expect(typeof response.body.short_url).toBe("number");
  });

  test("for url that fails dns lookup.", async () => {
    const url = "http://www.google.ca/non-existent";
    const response = await request
      .post("/api/shorturl/new")
      .send(`url=${url}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.error).toBe("invalid URL");
  });
});

describe("Getting urls", () => {
  test("for short url that's been added.", async () => {
    const url = "www.google.ca";
    const addResponse = await request
      .post("/api/shorturl/new")
      .send(`url=${url}`);

    const response = await request.get(
      `/api/shorturl/${addResponse.body.short_url}`
    );

    expect(response.status).toBe(302);
    expect(response.text).toBe(`Found. Redirecting to ${url}`);
  });

  test("for short url that has not been added.", async () => {
    const response = await request.get("/api/short/url/1000000");

    expect(response.status).toBe(404);
  });
});
