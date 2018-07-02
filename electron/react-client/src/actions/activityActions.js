import { ADD_ACTIVITY, PATCH_ACTIVITY, CATEGORIZE_ACTIVITY, DELETE_ACTIVITY, SET_ALL_ACTIVITIES, AFFIRM_CATEGORIZATION } from './types'; 
import axios from 'axios';

const config = require('../../reactConfig.js');
const serverURL = process.env.NODE_ENV === 'localhost' ? config.localhost : config.server;
console.log('server url is', serverURL);

export const addActivity = (data) => {
  return {
    type: ADD_ACTIVITY,
    payload: data
  }
}

export const deleteActivity = (activity, category, isTracked, user) => {
  let id = activity.id;

  const params = {
    user_name: user,
    app_name: activity.app,
    window_title: activity.title,
    prod_class: category,
    isTracked: isTracked
  }

  const request = axios.delete(serverURL + '/api/classifications', {data: params});
  return {
    type: DELETE_ACTIVITY,
    payload: {id, category}
  }
}

export const patchActivity = ({ activity, category, index }, data) => {
  return {
    type: PATCH_ACTIVITY,
    payload: {activity, category, index, data}
  }
}

export const changeCategory = (activity, oldCatName, newCatName, isTracked, user, wasML) => {
  const changeParams = {
    user_name: user,
    app_name: activity.app,
    window_title: activity.title,
    old_prod_class: oldCatName,
    prod_class: newCatName,
    isTracked: isTracked,
    wasML
  };

  const deleteParams = {
    user_name: user,
    app_name: activity.app,
    window_title: activity.title,
    prod_class: oldCatName,
    isTracked: isTracked
  };

  const request = newCatName === 'neutral' ? axios.delete(serverURL + '/api/classifications', {data: deleteParams}) :
  axios.post(serverURL + '/api/classifications', {params: changeParams});
  
  return {
    type: CATEGORIZE_ACTIVITY,
    payload: {
      request,
      id: activity.id,
      oldCatName,
      newCatName
    }
  }
}

export const affirmCategorization = (activity, category, isTracked, user) => {
  const params = {
    user_name: user,
    app_name: activity.app,
    window_title: activity.title,
    prod_class: category,
    isTracked: isTracked,
    ml: 'affirm'
  };
  const request = axios.post(serverURL + '/api/classifications', {params: params});
  return {
    type: AFFIRM_CATEGORIZATION,
    payload: {
      request,
      activity,
    }
  }
}

export const setAllActivities = (data) => {
  return {
    type: SET_ALL_ACTIVITIES,
    payload: data
  }
}

