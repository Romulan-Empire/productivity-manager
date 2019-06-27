const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const { Store } = require('./index.js');

// TODO: This doesn't work with Client somehow. Might be faster to run a single client than a pool.
const pool = new Pool({
  user: process.env.TEST_PG_USER,
  host: process.env.TEST_PG_HOST,
  database: process.env.TEST_PG_DATABASE,
  port: process.env.TEST_PG_PORT,
});

const schema = fs.readFileSync(path.resolve(__dirname, 'schema.sql')).toString();

const store = new Store(pool);

describe('test productivity class', () => {
  beforeAll(async () => {
    // run schema.sql
    await pool.query(schema);
  })
  
  afterEach(async () => {
    // drop all tables
    await pool.query(schema);
  })

  afterAll(async () => {
    pool.end();
  })

  test("adding and getting an app's productivity class", async () => {
    await store.addProductivityClass({ app_name: 'yolo', user_name: 'user1', window_title: 'yoloo', prod_class: 'productive'});
    const productivity = await store.getProductivityClass('yolo', null, 'user1');
    console.log(productivity);
    expect(productivity).toBe('productive');
  });

  test("getting the correct app productivity class by user", async () => {
    awai
  });
});
