const assert = require('assert');
const { stripEmoji, getDomainName } = require('./activitySanitizers');
const { assembleActivity, chunkComplete } = require('./activityMonitor.js');

describe('stripEmoji', () => {
  it('should remove speaker emojis from titles', () => {
    const titleWithEmoji = 'JavaScript Tutorial 🔊';
    assert.equal(stripEmoji(titleWithEmoji), 'JavaScript Tutorial');
  });
  it('should leave titles without speaker emojis alone', () => {
    const title = 'JavaScript Tutorial';
    assert.equal(stripEmoji(title), title);
  });
 });

 describe('getDomainName', () => {
  it('should get domain titles from full http urls', () => {
    const url = 'https://developer.mozilla.org/en-US/';
    assert.equal(getDomainName(url), 'mozilla.org');
  });
  it('should get domain titles from truncated urls', () => {
    const url = 'developer.mozilla.org/en-US/';
    assert.equal(getDomainName(url), 'mozilla.org');
  });
  it('should leave non-urls alone', () => {
    const url = 'MDN Web Docs';
    assert.equal(getDomainName(url), url);
  });
 });

describe('assembleActivity', () => {
  it('properly assembles activities', () => {
    // this is what an activeWin object looks like
    const activity = 
    {
      "owner": {
        "name": "Electron",
        "bundleId": "com.github.electron",
        "path": "\/Users\/brianlee\/productivity-manager\/electron\/node_modules\/electron\/dist\/Electron.app",
        "processId": 96362
      },
      "title": "Thyme.ly",
      "bounds": {
        "height": 1162,
        "x": 1240,
        "y": 270,
        "width": 1658
      },
      "id": 7783,
      "memoryUsage": 1128
    };

    const assembledActivity = assembleActivity(activity);
    assert.equal(assembledActivity.id, 7783);
    assert.equal(assembledActivity.app, 'Electron');
    assert.equal(assembledActivity.title, 'Thyme.ly');
  })
});

describe('chunkComplete', () => {
  it('detects when an activity chunk is completed by switching to a new app', () => {
    const lastActivity = {
      id: 1,
      app: 'Electron',
      title: 'Thyme.ly'
    };
    const newActivity = {
      id: 2,
      app: 'VS Code',
      title: 'index.js'
    };
    assert.equal(chunkComplete(lastActivity, newActivity), true);
  });
  it('detects when an activity chunk is completed by switching to a new title', () => {
    const lastActivity = {
      id: 1,
      app: 'Electron',
      title: 'Thyme.ly'
    };
    const newActivity = {
      id: 2,
      app: 'Electron',
      title: 'Other.app'
    };
    assert.equal(chunkComplete(lastActivity, newActivity), true);
  });
  it('does not detect a completed activity if the app and title are the same', () => {
    const lastActivity = {
      id: 1,
      app: 'Electron',
      title: 'Thyme.ly'
    };
    const newActivity = {
      id: 2,
      app: 'Electron',
      title: 'Thyme.ly'
    };
    assert.equal(chunkComplete(lastActivity, newActivity), false);
  });
});