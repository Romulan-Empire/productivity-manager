import React from 'react';
import ReactDOM from 'react-dom';
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

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

const auth = firebase.auth();
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
const provider = new firebase.auth.GoogleAuthProvider();
const [registerButton, loginButton, resetButton, links] = [
  document.getElementById('register'),
  document.getElementById('login'),
  document.getElementById('reset'),
  document.querySelectorAll('a'),
];

// gets id token from firebase, posts it to our server in order to receive a jwt
const getJWT = (user) => {
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

const loginUser = (authType, elements) => {
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
  loginUser('signInWithEmailAndPassword', elements);
});

registerButton.addEventListener('click', () => {
  const elements = {
    email: document.getElementById('reg-email'),
    password: document.getElementById('reg-password')
  };
  loginUser('createUserWithEmailAndPassword', elements);
});

resetButton.addEventListener('click', () => {
  const emailElement = document.getElementById('reset-email');
  auth.sendPasswordResetEmail(emailElement.value)
    .then(() => {
      alert('Check your inbox for the reset email from noreply@thymely-cd776.firebaseapp.com');
    })
    .catch((err) => {
      alert(`Error: ${err.message}`);
    })
    .finally(() => {
      emailElement.value = '';
    });
});

links.forEach((link) => {
  link.addEventListener('click', () => {
    const { className } = link;
    const forms = document.querySelectorAll("form");
    forms.forEach(form => {
      if (form.className === className) {
        form.style.display = "block";
      } else {
        form.style.display = "none";
      }
    });
  });
});



