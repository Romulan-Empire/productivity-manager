DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS scrape_categories;
DROP TABLE IF EXISTS machine_learning_log;
DROP TABLE IF EXISTS user_metrics;
DROP TABLE IF EXISTS pomodoro_pref;
DROP TABLE IF EXISTS errors;

CREATE TABLE users(
  user_id serial NOT NULL PRIMARY KEY,
  username VARCHAR(20) NOT NULL,
  hash VARCHAR(20),
  pomodoro_id VARCHAR(20)
);

CREATE TABLE activities(
  activity_id serial NOT NULL PRIMARY KEY,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  app_name VARCHAR NOT NULL,
  window_title VARCHAR,
  category VARCHAR,
  prod_class VARCHAR,
  url VARCHAR
);

CREATE TABLE categories(
  activity_id serial NOT NULL PRIMARY KEY,
  user_name VARCHAR,
  app_name VARCHAR NOT NULL,
  window_title VARCHAR,
  prod_class VARCHAR NOT NULL CHECK (prod_class = 'productive' or prod_class = 'neutral' or prod_class = 'distracting')
);

CREATE TABLE scrape_categories(
  activity_id serial NOT NULL PRIMARY KEY,
  scrape_session integer NOT NULL,
  window_title VARCHAR UNIQUE,
  prod_class VARCHAR NOT NULL CHECK (prod_class = 'productive' or prod_class = 'distracting'),
  app_name VARCHAR NOT NULL,
  user_name VARCHAR NOT NULL
);

CREATE TABLE machine_learning_log(
  log_id serial NOT NULL PRIMARY KEY,
  timestamp timestamp,
  action VARCHAR NOT NULL CHECK (action = 'affirm' or action = 'reject')
);

CREATE TABLE user_metrics(
  date TIMESTAMP not null,
  prod_number integer
);

CREATE TABLE pomodoro_pref(
  pom_id integer,
  focus_length integer,
  break_length integer,
  long_break_length integer,
  sessions_per_round integer
);

CREATE TABLE errors(
  error_id serial NOT NULL PRIMARY KEY,
  error_message VARCHAR NOT NULL
);

