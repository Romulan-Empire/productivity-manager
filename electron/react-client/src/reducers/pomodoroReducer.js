import { START_POM, PAUSE_POM, RESUME_POM, CLEAR_POM, COMPLETE_SPURT, SET_POM_PREFS } from '../actions/types';
import moment from 'moment';

const timestamp = () => {
  return moment().format('LTS');
}

const initialState = {
  pomStartTime: null,
  status: 'not started',
  currentSpurt: {
    type: null,
    length: null
  },
  completedSpurtCount: {
    work: 0,
    shortBreak: 0,
    longBreak: 0
  },
  elapsedTimeFromCompletedSpurts: 0,
  prefs : {
    workLength: 1000 * 60 * 25,
    shortBreakLength: 1000 * 60 * 5,
    longBreakLength: 1000 * 60 * 25,
    spurtsBeforeLongBreak: 4,
    pomSessionsPerDay: 4
  }
};

const pomodoro = (state = initialState, action) => {
  switch (action.type) {
    case START_POM: {
      return {
        ...state,
        status: 'running',
        pomStartTime: timestamp(),
        currentSpurt: {
          type: 'work',
          length: state.prefs.workLength
        }
      }
    }
    case PAUSE_POM: {
      return {
        ...state,
        status: 'paused',
      }
    }
    case RESUME_POM: {
      return {
        ...state,
        status: 'running'
      }
    }
    case CLEAR_POM: {
      return {
        ...initialState,
        currentSpurt: {
          ...initialState.currentSpurt
        },
        completedSpurtCount: {
          ...initialState.completedSpurtCount
        },
        prefs: {
          ...state.prefs
        }
      }
    }
    case SET_POM_PREFS: {
      return {
        ...initialState,
        prefs: action.payload
      }
    }
    case COMPLETE_SPURT: {
      const lastElapsedTime = state.elapsedTimeFromCompletedSpurts;
      const lastSpurtType = state.currentSpurt.type;
      const updatedLastSpurtCount = state.completedSpurtCount[lastSpurtType] + 1;
      const { work, shortBreak, longBreak } = state.completedSpurtCount;
      const INTERVAL_MAP = {
        'work': state.prefs.workLength,
        'shortBreak': state.prefs.shortBreakLength,
        'longBreak': state.prefs.longBreakLength
      };
      
      let nextSpurtType, elapsedTime;
      if (lastSpurtType === 'work' && updatedLastSpurtCount % state.prefs.spurtsBeforeLongBreak === 0) { //expand logic to depend on user prefs
        nextSpurtType = 'longBreak';
        elapsedTime = state.prefs.workLength;
      } else if (lastSpurtType === 'work') {
        nextSpurtType = 'shortBreak';
        elapsedTime = state.prefs.workLength;
      } else {
        nextSpurtType = 'work'
        if (lastSpurtType === 'shortBreak') elapsedTime = state.prefs.shortBreakLength;
        else elapsedTime = state.prefs.longBreakLength;
      }
      let noti = new Notification('Pomodoro Alert', {body: lastSpurtType + ' over! Time for ' + nextSpurtType, soundName: 'default'});
      noti.addEventListener('click', () => noti.close());
      const updatedElapsedTime = lastElapsedTime + elapsedTime;

      return {
        ...state,
        elapsedTimeFromCompletedSpurts: updatedElapsedTime,
        currentSpurt: {
          type: nextSpurtType,
          length: INTERVAL_MAP[nextSpurtType]
        },
        completedSpurtCount: {
          ...state.completedSpurtCount,
          [lastSpurtType]: updatedLastSpurtCount
        }
      }
    }
    default:
      return state;
  }
}

export default pomodoro;