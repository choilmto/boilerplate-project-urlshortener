const { createApp, startServer } = require('./app');
const mongoose = require('mongoose');
const supertest = require('supertest');

// MONGO_URL is provided by @shelf/jest-mongodb
const dbUri = process.env.MONGO_URL;
const port = 0;
let request;
let appServer;

beforeAll (async () => {
  appServer = await startServer(createApp, dbUri, port);
  request = supertest(appServer);
});

afterAll(() => {
    return Promise.all([mongoose.disconnect(), appServer.close()]);
});

describe("GET", () => {
  test("/api/hello", async () => {
    const response = await request.get("/api/hello");

    expect(response.status).toBe(200);
    expect(response.body.greeting).toBe("hello API");
  });
});