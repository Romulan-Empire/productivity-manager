import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { remote, ipcRenderer } from 'electron';
import axios from 'axios';

import App from './App.jsx';
import config from '../reactConfig.js';
const { bundleId, clientId, redirectURI } = config;
const serverURL = process.env.NODE_ENV === 'localhost' ? config.localhost : config.server;

//bypass login page if a user is logged in already via cookie
ipcRenderer.send('cookies', 'check');
ipcRenderer.on('cookies', (event, message) => {
  ReactDOM.render((<App/>), document.getElementById('app'));
  document.getElementById('login-page').innerHTML = '';
});

$('.message a').click(function(){
  $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
});

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

const auth = firebase.auth();
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
const provider = new firebase.auth.GoogleAuthProvider();
const registerButton = document.getElementById('register');
const loginButton = document.getElementById('login');

const getJWT = (user) => {
  // get id token from firebase and post it to our server to get a jwt
  return user.getIdToken()
    .then((idToken) => {
      console.log('serverURL is', serverURL)
      return axios.post(serverURL + '/session', {idToken});
    });
};

const renderApp = (uId, jwtToken) => {
  ipcRenderer.send('cookies', 'logged in', {user: uId, jwt: jwtToken});
  ReactDOM.render((<App/>), document.getElementById('app'));
  document.getElementById('login-page').innerHTML = '';
};

const handleClick = (authType, elements) => {
  const {email, password} = elements;
  auth[authType](email.value, password.value)
    .then((data) => {
      return getJWT(data.user);
    })
    .then((resp) => {
      renderApp(resp.data.uid, resp.data.token);
    })
    .catch((err) => {
      alert(`Error: ${err.message}`);
      email.value = '';
      password.value = '';
    });
};

loginButton.addEventListener('click', () => {
  const elements = {
    email: document.getElementById('email'),
    password: document.getElementById('password')
  };
  handleClick('signInWithEmailAndPassword', elements);
});

registerButton.addEventListener('click', () => {
  const elements = {
    email: document.getElementById('reg-email'),
    password: document.getElementById('reg-password')
  };
  handleClick('createUserWithEmailAndPassword', elements);
});

