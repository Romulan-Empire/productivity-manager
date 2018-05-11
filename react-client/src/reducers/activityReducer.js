//pure, centralized updates to store

import { GET_ACTIVITIES, ADD_ACTIVITY, PATCH_ACTIVITY, CATEGORIZE_ACTIVITY, DELETE_ACTIVITY } from '../actions/types'; 
import moment from 'moment';

const initialState = {
  neutral: [],
  productive: [],
  distracting: [],
  nextId: 1
};

const activities = (state = initialState, action) => {
  // console.log('reached reducer');
  switch(action.type){
    case GET_ACTIVITIES: 
      return {
        ...state, 
      }
    case ADD_ACTIVITY:
      // console.log('reducer add act', action.payload)
      // console.log(state)
      let {app, title, startTime, endTime, productivity} = action.payload
      let duration = getDuration(startTime, endTime)
      let newData = {
        'id': state.nextId,
        'app': app,
        'title': title,
        'spurts': [{'startTime': startTime, 'endTime': endTime}],
        'duration': duration, //function to calc duration
        'productivity': productivity || 'neutral' //if null, make neutral for now
      }
      console.log('productivity cat inside reducer is', newData.productivity);
      return {
        ...state,
        [newData.productivity]: [... state[newData.productivity], newData],
        nextId: ++state.nextId
      }

    case DELETE_ACTIVITY:
      console.log('inside DELETE ACTIVITY REDUCER');
      let newArr = state[action.payload.category].filter((el) => el.id != action.payload.id);
      return {
        ...state,
        [action.payload.category]: newArr
      };

    case PATCH_ACTIVITY:
      let {category, index, activity, data} = action.payload
      let copySpurts = activity.spurts.slice()
      let updatedActivity = Object.assign({
        spurts: copySpurts
      }, activity);
    
      updatedActivity.spurts.push({'startTime': data.startTime, 'endTime': data.endTime})
      updatedActivity.duration += getDuration(data.startTime, data.endTime);

      return {
        ...state,
        [category]: [
                    ...state[category].slice(0,index),
                    updatedActivity,
                    ...state[category].slice(index + 1)
                    ]
      }
      // return state
    case CATEGORIZE_ACTIVITY:
      let {id, oldCatName, newCatName} = action.payload;
      const movingActivity = state[oldCatName].filter((el) => el.id === id)[0];
      const updatedOldCat = state[oldCatName].filter((el) => el.id !== id);
      const updatedNewCat = [...state[newCatName] , movingActivity];
      return {
        ...state,
        [oldCatName]: updatedOldCat,
        [newCatName]: updatedNewCat
      };
    default: 
      // console.log('default', state)
      return state;
  }
}

const getDuration = (start, end) => {
  return moment
          .duration(
            moment(end, "MMMM Do YYYY, h:mm:ss a")
            .diff(moment(start, "MMMM Do YYYY, h:mm:ss a"))
          )
          .asSeconds();
}


export default activities;
