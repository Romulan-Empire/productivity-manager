import { ADD_ACTIVITY, PATCH_ACTIVITY, CATEGORIZE_ACTIVITY,
        DELETE_ACTIVITY, SET_ALL_ACTIVITIES, AFFIRM_CATEGORIZATION } from '../actions/types'; 
import { getDuration } from '../constants.js';

const initialState = {
  neutral: [],
  productive: [],
  distracting: [],
  nextId: 1
}

const activities = (state = initialState, action) => {

  switch (action.type) {
    case ADD_ACTIVITY: {
      const {app, title, startTime, endTime, productivity} = action.payload;
      const duration = getDuration(startTime, endTime);
      const convertedProd = {
        ...productivity,
        class: productivity.class || 'neutral'
      };
      const newData = {
        'id': state.nextId,
        'app': app,
        'title': title,
        'spurts': [{'startTime': startTime, 'endTime': endTime}],
        'duration': duration,
        'productivity': convertedProd
      }
      return {
        ...state,
        [newData.productivity.class]: [...state[newData.productivity.class], newData],
        nextId: state.nextId + 1
      }
    }

    case DELETE_ACTIVITY: {
      const { id, category } = action.payload;
      const updatedCategoryArray = state[category].filter((el) => el.id !== id);
      return {
        ...state,
        [category]: updatedCategoryArray
      };
    }

    case PATCH_ACTIVITY: {
      const { index, activity, data } = action.payload;
      const { startTime, endTime } = data;
      const prodClass = activity.productivity.class;

      const updatedActivity = {
        ...activity,
        spurts: [...activity.spurts, {'startTime': startTime, 'endTime': endTime}],
        duration: activity.duration + getDuration(startTime, endTime)
      };
      return {
        ...state,
        [prodClass]: [
                    ...state[prodClass].slice(0,index),
                    updatedActivity,
                    ...state[prodClass].slice(index + 1)
                    ]
      };
    }

    case CATEGORIZE_ACTIVITY: {
      const { id, oldCatName, newCatName } = action.payload;
      const movingActivity = state[oldCatName].filter((el) => el.id === id)[0];
      const updatedActivity = {
        ...movingActivity,
        productivity: {
          source: 'user',
          class: newCatName
        }
      };
      const updatedOldCategoryActivities = state[oldCatName].filter((el) => el.id !== id);
      const updatedNewCategoryActivities = [...state[newCatName] , updatedActivity];

      return {
        ...state,
        [oldCatName]: updatedOldCategoryActivities,
        [newCatName]: updatedNewCategoryActivities
      };
    }

    case AFFIRM_CATEGORIZATION: {
      const { activity } = action.payload;
      const prodClass = activity.productivity.class;
      const activityIdx = state[prodClass].indexOf(activity);
      const affirmedActivity = {
        ...activity,
        productivity: {
          source: 'user',
          class: prodClass
        }
      }

      return {
        ...state,
        [prodClass]: [
          ...state[prodClass].slice(0, activityIdx),
          affirmedActivity,
          ...state[prodClass].slice(activityIdx + 1)
        ]
      }
    }
    case SET_ALL_ACTIVITIES: {
      let neutral = []
      let productive = []
      let distracting = []
      action.payload.forEach((activity) => {
        if (activity.productivity.class === 'neutral') neutral.push(activity);
        if (activity.productivity.class === 'productive') productive.push(activity);
        if (activity.productivity.class === 'distracting') distracting.push(activity);
      });
      return {
        ...state,
        neutral: neutral,
        productive: productive,
        distracting: distracting,
        nextId: action.payload.length
      }
    }
    
    default: 
      return state;
  }
  
}

export default activities;
