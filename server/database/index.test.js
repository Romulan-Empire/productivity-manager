const db = require('./index.js');
const { Client } = require('pg');

const client = new Client({
  user: process.env.TEST_PG_USER,
  host: process.env.TEST_PG_HOST,
  database: process.env.TEST_PG_DATABASE,
  password: process.env.TEST_PG_PASSWORD,
  port: process.env.TEST_PG_PORT,
});

describe('test productivity class', () => {
  test('yolo', () => {
    expect(1).toBe(1);
  });
});