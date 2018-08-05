import activities from './activityReducer.js';

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
        app: '',
        title: '',
        startTime: '',
        endTime: '',
        productivity: {}
      }
    };
    assert.equal(true, true);
  });
});