const assert = require('assert');
const { stripEmoji, getDomainName } = require('./activitySanitizers');

describe('stripEmoji', () => {
  it('is a function', () => {
    assert.equal(typeof stripEmoji, 'function');
  });
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
   it('is a function', () => {
    assert.equal(typeof getDomainName, 'function');
   });
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
 })