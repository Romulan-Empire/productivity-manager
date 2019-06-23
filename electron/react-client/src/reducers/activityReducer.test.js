import activities from './activityReducer.js';

describe('addActivity', () => {
  const initialState = {
    neutral: [],
    productive: [],
    distracting: [],
    nextId: 1
  };
  
  // to test that the reducer doesn't mutate initial state
  const initialStateCopy = {...initialState};

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

  const newState = activities(initialState, action);

  //TODO: Add another scenario where initialState is already populated

  test('does not mutate the initial state', () => {
    expect(initialState).toEqual(initialStateCopy);
  });

  test('adds the new activity to the proper category only', () => {
    expect(newState.neutral.length).toBe(0);
    expect(newState.productive.length).toBe(1);
    expect(newState.distracting.length).toBe(0);
  });
  
  test(`converts the new activity's start and end time into spurts`, () => {
    const { startTime, endTime } = action.payload;
    const newActivity = newState.productive[0];
    expect(newActivity.spurts[0].startTime).toBe(startTime);
    expect(newActivity.spurts[0].endTime).toBe(endTime);
  });

  test(`otherwise copies the new activity's data into state`, () => {
    const { app, productivity, title } = action.payload;
    const newActivity = newState.productive[0];
    expect(newActivity.app).toBe(app);
    expect(newActivity.title).toBe(title);
    expect(newActivity.productivity).toEqual(productivity);
  });

  test('assigns the last nextId to the new activity', () => {
    const newActivity = newState.productive[0];
    expect(newActivity.id).toBe(initialState.nextId);
  });

  test('properly increments nextId', () => {
    expect(newState.nextId).toBe(initialState.nextId + 1);
  });
});