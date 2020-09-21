const connectDb = require("./db-connection");

// logger stub with spies
const log = {
  info: jest.fn(),
};

describe("DB connection", () => {
  // Causes connection to db to fail
  const DB_URI = "";

  test("fails with invalid uri for db.", () => {
    return expect(() => connectDb(log, DB_URI)).rejects.toThrow();
  });
});

describe("DB connection", () => {
  // MONGO_URL is provided by @shelf/jest-mongodb
  const DB_URI = process.env.MONGO_URL;
  let client;
  afterAll(() => {
    return client.close();
  });

  test("is succesful.", () => {
    return connectDb(log, DB_URI).then((connectedClient) => {
      client = connectedClient;
      expect(log.info).toBeCalled();
    });
  });
});
