import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { parse } from 'url'
import { remote, ipcRenderer } from 'electron'
import axios from 'axios'
import qs from 'qs'
import readline from 'readline';
import { google } from 'googleapis'
import cron from 'cron';
import moment from 'moment';

import App from './App.jsx';
import config from '../config.js'
import { apiKey, bundleId, clientId, redirectURI, discoveryDocs, scopes, clientSecret } from '../config.js'

//if logged in already, should render app directly AND add uID to redux store
  //else render this log in screen
// if user logs out, destroy the cookie

//check to see if cookie exists
  //if cookie exists, skip this screen and render app
    //need to somehow connect user_id to redux store
//if not wait for login
  //upon successful login set the cookie
//also listen for a logout action
  //destroy cookie


//cookie checking routine (MOVE TO ANOTHER COMPONENT SO LOGIN NEVER EVEN RENDERS IF USER IS LOGGED IN)
ipcRenderer.send('cookies', 'check');
ipcRenderer.on('cookies', (event, message) => {
  ReactDOM.render((<App user={message.value}/>), document.getElementById('app'))
  document.getElementById('login-page').innerHTML = '';
});

ipcRenderer.send('token', 'check');
// ipcRenderer.once('token', (event, token) => {
//   // listEvents(token)
// });


$('.message a').click(function(){
  $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
});

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
var registerButton = document.getElementById('register')
var loginButton = document.getElementById('login')
var googleButton = document.getElementById('google')

googleButton.addEventListener('click', () => {
  googleSignIn()
})

registerButton.addEventListener('click', () => {
  let name = document.getElementById('reg-name').value
  let email = document.getElementById('reg-email').value
  let password = document.getElementById('reg-password').value

  auth.createUserWithEmailAndPassword(email, password)
  .then((data) => {
    ipcRenderer.send('cookies', 'logged in', data.user.uid);
    ReactDOM.render((<App />), document.getElementById('app'))
    document.getElementById('login-page').innerHTML = ''
  })
  .catch((err) => alert(JSON.stringify(err)));
})


loginButton.addEventListener('click', () => {
  let email = document.getElementById('email').value
  let password = document.getElementById('password').value
  auth.signInWithEmailAndPassword(email, password)
  .then((data) => {
    const uId = data.user.uid;
    ipcRenderer.send('cookies', 'logged in', uId)
    ReactDOM.render((<App user={uId}/>), document.getElementById('app'))
    document.getElementById('login-page').style.display = 'none'
    
  })
  .catch((err) => {
    // console.error(err);
    alert('Username/password combination do not match.')
    document.getElementById('email').value = ''
    document.getElementById('password').value = ''
  })
})

function googleSignIn () {
  signInWithPopup()
  .then((code) => {
    return fetchAccessTokens(code)
  })
  .then((token) => {
    return fetchGoogleProfile(token)
  })
  .then(({id, email, name}) => {
    return {
      id: id,
      email: email,
      name: name
    }
  })
}

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'
const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/userinfo/v2/me'

function signInWithPopup (provider) {
  return new Promise((resolve, reject) => {
    const authWindow = new remote.BrowserWindow({
      width: 500,
      height: 600,
      show: true,
    })

    const urlParams = {
      response_type: 'code',
      redirect_uri: bundleId + ':' +redirectURI,
      client_id: clientId,
      scope: 'profile email https://www.googleapis.com/auth/calendar',
    }
    const authUrl = `${GOOGLE_AUTHORIZATION_URL}?${qs.stringify(urlParams)}`

    function handleNavigation (url) {
      const query = parse(url, true).query
      if (query) {
        if (query.error) {
          reject(new Error(`There was an error: ${query.error}`))
        } else if (query.code) {
          // Login is complete
          authWindow.removeAllListeners('closed')
          setImmediate(() => authWindow.close())
          resolve(query.code)
          //move this to google event listener
          ReactDOM.render((<App />), document.getElementById('app'))
          document.getElementById('login-page').innerHTML = ''
        }
      }
    }

    authWindow.webContents.on('will-navigate', (event, url) => {
      handleNavigation(url)
    })

    authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
      handleNavigation(newUrl)
    })

    authWindow.loadURL(authUrl)
  })
}

function fetchAccessTokens (code) {
  return axios.post(GOOGLE_TOKEN_URL, qs.stringify({
    code,
    client_id: clientId,
    redirect_uri: bundleId + ':' +redirectURI,
    grant_type: 'authorization_code',
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  .then((data) => data.data.access_token)
}

function fetchGoogleProfile (accessToken) {
  return axios.get(GOOGLE_PROFILE_URL, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  })
  .then((data) => {
    ipcRenderer.send('cookies', 'logged in', data.data.id)
    ipcRenderer.send('token', 'logged in', accessToken)
    return data.data
  })
}

//------------------------------------------------------------------------- GOOGLE CALENDAR

let prevEventsIds = {};
let upcomingEvents = [];
let token;

function listEvents(accessToken) {
  token = accessToken;
  const calendar = google.calendar({version: 'v3', auth});
  let oauth = new google.auth.OAuth2(
    clientId, clientSecret, redirectURI);
  oauth.setCredentials({access_token: accessToken});
  let timeMin = moment().format().slice(0, 19) + '-04:00' //EST
  let timeMax = moment().format().slice(0, 11) + '23:59:59-04:00'
  calendar.events.list({
    calendarId: 'primary',
    auth: oauth,
    maxResults: 10,
    singleEvents: true,
    timeMin: timeMin,
    timeMax: timeMax,
    orderBy: 'startTime'
  }, (err, data) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = data.data.items;
    if (events.length) {
      events.map((event, i) => {
        if(upcomingEvents.length === 0) upcomingEvents.push(event);
        else updateEventIfMatch(event)
      });
    } else {
      console.log('No upcoming events found.');
    }
  });
}

function notificationSender(upcomingEvents) {
  upcomingEvents.map((event, idx) => {
    let eventTime = event.start.dateTime
    let currentTime = JSON.stringify(moment().format()).split('T').join(' ').slice(0, 20)
    let difference = moment.duration(moment(eventTime).diff(moment(currentTime))).asSeconds();

    if(difference < 600) { 
      if (difference > 0) { // send notification if event is within 10 minutes
        let noti = new Notification('Upcoming Calendar Event', {body: event.summary, soundName: 'default'});
        noti.addEventListener('click', () => noti.close());    
      }
      upcomingEvents.splice(idx, 1); //simply remove if event has already passed
      prevEventsIds[event.id] = true;
    }
  })
}

function updateEventIfMatch (newEvent) {
  let noMatch = true;
  upcomingEvents.map((oldEvent, idx) => {
    if(oldEvent.id === newEvent.id){
      noMatch = false;
      if(oldEvent.start.dateTime !== newEvent.start.dateTime) upcomingEvents.splice(idx, 1, newEvent)
      return;
    }
  })
  if(noMatch && !prevEventsIds[newEvent.id]) upcomingEvents.push(newEvent);
}

let timer = new cron.CronJob({
  cronTime: '*/5 * * * * *', //checking every 5 seconds
  onTick: function () {
    if(upcomingEvents.length > 0) notificationSender(upcomingEvents);
    if(token) listEvents(token);
  },
  start: true,
  timeZone: 'America/New_York'
});

exports.listEvents = listEvents;
