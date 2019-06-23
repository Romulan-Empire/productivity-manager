import { TRACK_APP_TITLE, UNTRACK_APP_TITLE } from '../actions/types'; 

const initialState = {
  trackedApps: ['Google Chrome', 'Chromium-browser', 'Firefox', 'Safari', 'Idle']
}

const preferences = (state = initialState, action) => {

  switch (action.type) {
    case TRACK_APP_TITLE:
      return {
        ...state,
        trackedApps: [... state.trackedApps, action.payload.data]
      }

    case UNTRACK_APP_TITLE:
      return {
        ...state,
        trackedApps: state.trackedApps.filter((el) => el !== action.payload.data)
      };
    
    default: 
      return state;
  }
}



export default preferences;
