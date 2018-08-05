import activities from './activityReducer.js';
console.log('activities is', activities)
const { getDuration } = require('../constants.js');
const assert = require('assert');

describe('addActivity', () => {
  beforeEach(function() {
    // runs before each test in this block
  });
  it('should increment nextId', () => {
    const initialState = {
      neutral: [],
      productive: [],
      distracting: [],
      nextId: 1
    };

    const action = {
      type: 'ADD_ACTIVITY',
      payload: {
        "app":"Google Chrome",
        "endTime":"August 2nd 2018, 9:32:45 pm",
        "id":3787,
        "productivity":{
          "class":"productive",
          "source":"ml"
        },
        "startTime":"August 2nd 2018, 9:32:44 pm",
        "title":"npm install broken · Issue #665 · ssbc/patchwork"
      }
    };

    const newData = {
      id: 1,
      app: 'Google Chrome',
      title: 'npm install broken · Issue #665 · ssbc/patchwork',
      spurts: [
        {
          startTime: 'August 2nd 2018, 9:32:44 pm',
          endTime: 'August 2nd 2018, 9:32:45 pm'
        }
      ],
      duration: getDuration("August 2nd 2018, 9:32:44 pm", "August 2nd 2018, 9:32:45 pm"),
      productivity: {
        class: 'productive',
        source: 'ml'
      }
    };

    const newState = {
      neutral: [],
      productive: [newData],
      distracting: [],
      nextId: 2
    };
    // console.log('actual activity is', JSON.stringify(activities(initialState,action)));
    assert.deepEqual(activities(initialState, action), newState);
  });
});