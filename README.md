# Thymely

> Because there's no time like the present


## Table of Contents

1. [Intro](#Intro)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Running in Development Mode](#running-in-development-mode)
1. [Team](#team)
1. [Architecture](#architecture)
1. [Contributing](#contributing)

## Intro

> A smart desktop productivity app built with JavaScript and Electron

Thymely is a productivity application that allows users to categorize their application activity as productive or distracting so they can see how productive they've been throughout the day.  Thymely also allows users to categorize their visited website titles.  Because it would be extremely time consuming (and somewhat ironically counterproductive) for a user to categorize every webpage they've been to during the day, Thymely uses machine learning to suggest their productivity classifications, which the user can override as necessary.

Thymely uses a SQLite3 database local to the user's computer to persist all user activity and a cloud PostgreSQL database to store user classifications of apps and website titles as productive or non-productive.  This classification data, as well as training data obtained from web scraper workers, forms the data used by the machine learning model to predict classifications.

Thymely also includes various data visualizations and a Pomodoro timer using Recharts, a D3 library.

Thymely is integrated with Google, specifically Google OAuth and Google Calendar alerts.

See thymely.co for more details.

## Key Technologies Used

- React
- Redux
- Electron
- Recharts / D3
- Material UI
- SQLite3
- Firebase
- Node
- Express
- PostgreSQL

## Development

### Installing Dependencies

The app is split into the `electron` and `server` top level folders.  To install dependencies, run `npm install` from each of those folders.

### Running in Development Mode
From inside the `electron` folder, run `npm start` to run the Thymely client in dev mode.  To create a MacOS executable, run `npm run package` and to create a zip file which includes the executable, run `npm run make`.  The executable or zip will appear in the `electron/out` folder.

To run the server in development mode, run `npm run dev` from inside the `server` folder.  You will probably also want the Electron client to point to your localhost and not our cloud server.  To do this, run `npm run local-electron-dev` from either the top level directory or the `electron` folder.

To run the web scraper, use `npm run scrape` after making the appropriate edits inside the scraper file.

If you are in the top-level repo directory you can also use `npm run electron-dev`, `npm run server-dev`, and/or `npm run local-electron-dev` to `cd` into the appropriate directory and run in development mode.

## Team

  - __Full Stack Developers__: Andrew Lee, Brian Lee, Wei Gao

### Architecture

  - Architecture diagram coming soon

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.