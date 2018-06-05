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

> A smart desktop productivity app built in JavaScript and Electron

Thymely is a productivity application that allows users to categorize their application activity as productive or distracting.  In the case of web browsers, Thymely also allows users to categorize their visited website titles.  Because it is impractical for a user to classify all of their websites, Thymely also uses machine learning to suggest their productivity classifications, which the user can affirm or reject.

Thymely uses a local SQLite3 database to persist all user activity and a cloud PostgreSQL database to store user classifications of apps and website titles as productive or non-productive.  This classification data, as well as training data obtained from web scraper workers, forms the data used by the machine learning model to predict classifications.

Thymely also includes various data visualizations and a Pomodoro timer using Recharts, a D3 library.

Thymely is also integrated with Google, with Google OAuth and Google Calendar alerts.

See <a href="http://thymely.co" target="_blank">thymely.co</a> for more details.

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

To run the server in development mode, run `npm run dev` from inside the `server` folder.  You will also probably want to edit the Electron client's config file so that `serverURL` points to your local host, not our cloud server.  To do this, edit the config files in both `electron/main/config.js` and `electron/react-client/config.js`.

To run the web scraper, use `npm run scrape` after making the appropriate edits inside the scraper file.

## Team

  - __Full Stack Developers__: Andrew Lee, Brian Lee, Wei Gao

### Architecture

  - Architecture diagram coming soon

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.