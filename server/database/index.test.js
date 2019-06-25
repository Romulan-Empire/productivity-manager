const { Store } = require('./index.js');
const { Pool } = require('pg');
const fs = require('fs');


// TODO: This doesn't work with Client somehow. Might be faster to run a single client than a pool.
const pool = new Pool({
  user: process.env.TEST_PG_USER,
  host: process.env.TEST_PG_HOST,
  database: process.env.TEST_PG_DATABASE,
  port: process.env.TEST_PG_PORT,
});

const schema = fs.readFileSync('./schema.sql').toString();
console.log('schema is', schema)

const store = new Store(pool);

describe('test productivity class', () => {
  beforeAll(() => {
    // run schema.sql
  })
  
  afterAll(() => {
    // drop all tables
    pool.end();
  })

  test('add and get productivity class', async () => {
    const result = await store.addProductivityClass({ app_name: 'yolo', user_name: 'user1', window_title: 'yoloo', prod_class: 'productive'});
    console.log(result);
    // expect(1).toBe(1);
    const productivity = await store.getProductivityClass('yolohoho', null, 'user1');
    console.log(productivity);
    expect(productivity).toBe('productive');
  });
});

// setup tables before and drop tables after done?