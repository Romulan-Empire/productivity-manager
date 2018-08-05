import activities from './activityReducer.js';
import assert from 'assert';

describe('addActivity', () => {
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

  const newState = activities({...initialState}, action);

  it('adds the new activity to the proper category only', () => {
    assert.equal(newState.neutral.length, 0);
    assert.equal(newState.productive.length, 1);
    assert.equal(newState.distracting.length, 0);
  });
  
  it(`converts the new activity's start and end time into spurts`, () => {
    const { startTime, endTime } = action.payload;
    const newActivity = newState.productive[0];
    assert.equal(newActivity.spurts[0].startTime, startTime);
    assert.equal(newActivity.spurts[0].endTime, endTime);
  });

  it(`otherwise copies the new activity's data into state`, () => {
    const { app, productivity, title } = action.payload;
    const newActivity = newState.productive[0];
    assert.equal(newActivity.app, app);
    assert.equal(newActivity.title, title);
    assert.deepEqual(newActivity.productivity, productivity);
  });

  it('assigns the last nextId to the new activity', () => {
    const newActivity = newState.productive[0];
    assert.equal(initialState.nextId, newActivity.id);
  });

  it('properly increments nextId', () => {
    assert.equal(initialState.nextId + 1, newState.nextId, 'wtf');
  });
});