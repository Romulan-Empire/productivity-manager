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

describe('store', () => {
  beforeAll(async () => {
    // run schema.sql
    await pool.query(schema);
  });

  beforeEach(async () => {
    await store.addProductivityClass({
      app_name: 'iTerm2',
      user_name: 'user1',
      window_title: 'bash',
      prod_class: 'productive',
    });

    await store.addProductivityClass({
      app_name: 'iTerm2',
      user_name: 'user2',
      window_title: 'bash',
      prod_class: 'distracting',
    });

    await store.addProductivityClass({
      app_name: 'Google Chrome',
      user_name: 'user1',
      window_title: 'Stack Overflow',
      prod_class: 'productive',
    });

    await store.addProductivityClass({
      app_name: 'Google Chrome',
      user_name: 'user1',
      window_title: 'Sous Vide Recipes',
      prod_class: 'distracting',
    });

    await store.addProductivityClass({
      app_name: 'Google Chrome',
      user_name: 'user2',
      window_title: 'Sous Vide Recipes',
      prod_class: 'productive',
    });
  });
  
  afterEach(async () => {
    // drop all tables
    await pool.query(schema);
  });

  afterAll(async () => {
    pool.end();
  });

  it("gets the specified user's productivity classification for a given non-browser app", async () => {
    const user1Productivity = await store.getProductivityClass('iTerm2', null, 'user1');
    expect(user1Productivity).toBe('productive');
    const user2Productivity = await store.getProductivityClass('iTerm2', null, 'user2');
    expect(user2Productivity).toBe('distracting');
  });

  it("returns null if the user has not classified the app", async() => {
    const unsetProductivity = await store.getProductivityClass('iTerm3', null, 'user1');
    expect(unsetProductivity).toBeNull();
  })

  it("gets the specified user's classification of a given window title for a browser app", async () => {
    const productivity1 = await store.getProductivityClass('Google Chrome', 'Stack Overflow', 'user1');
    expect(productivity1).toBe('productive');
    const productivity2 = await store.getProductivityClass('Google Chrome', 'Sous Vide Recipes', 'user1');
    expect(productivity2).toBe('distracting');
  })

  it("updates a user's productivity classification for a given app", async () => {
    await store.changeProductivityClass({
      user_name: 'user2',
      app_name: 'iTerm2',
      prod_class: 'productive',
      old_prod_class: 'distracting',
    });

    const newProductivity = await store.getProductivityClass('iTerm2', null, 'user2');
    expect(newProductivity).toBe('productive');
  });

  it("updates a user's classification for a given window title", async () => {
    await store.changeProductivityClass({
      user_name: 'user1',
      app_name: 'Google Chrome',
      window_title: 'Sous Vide Recipes',
      prod_class: 'productive',
    });

    const newProductivity = await store.getProductivityClass('Google Chrome', 'Sous Vide Recipes', 'user1');
    expect(newProductivity).toBe('productive');
  })

  it("adds or changes a user's productivity classification as necessary", async () => {
    await store.addOrChangeProductivity({
      user_name: 'user2',
      app_name: 'iTerm2',
      prod_class: 'productive',
      old_prod_class: 'distracting',
    });

    const updatedProductivity = await store.getProductivityClass('iTerm2', null, 'user2');
    expect(updatedProductivity).toBe('productive');

    await store.addOrChangeProductivity({
      user_name: 'user1',
      app_name: 'Thymely',
      prod_class: 'productive',
    });

    const newProductivity = await store.getProductivityClass('Thymely', null, 'user1');
    expect(newProductivity).toBe('productive');
  });

  it("deletes a user's productivity classification", async () => {
    await store.deleteProductivityClass({
      user_name: 'user1',
      app_name: 'iTerm2',
      window_title: 'bash',
      prod_class: 'productive',
      isTracked: false,
    });

    const deletedProductivity = await store.getProductivityClass('iTerm2', null, 'user1');
    expect(deletedProductivity).toBeNull();
  })
});
