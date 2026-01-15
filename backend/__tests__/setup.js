// Setup file for Jest
const { closeDatabase } = require('../config/database.test');

// Increase timeout for all tests
jest.setTimeout(10000);

// Close database after all tests
afterAll(async () => {
  await closeDatabase();
});