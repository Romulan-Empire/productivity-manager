const stripEmoji = (title) => {
  const indexOfEmoji = title.indexOf('🔊'); //indicates a window is playing sound
  if (indexOfEmoji > -1) {
    const noEmoji = title.replace('🔊', '');
    return noEmoji.substring(0, noEmoji.length - 1);
  } else return title;
};

const getDomainName = (url) => {
  const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im)
  if (match) {
    const result = match[1]
    const secondMatch = result.match(/^[^\.]+\.(.+\..+)$/)
    if (secondMatch) {
        return secondMatch[1]
    }
    return result
  }
  return url
};

const sanitizeTitle = (title) => {

  let titlesObj = {
    '': ' ',
    'New Tab': ' ',
    'Home': ' ',
    'Forwarding...': ' ',
    'Untitled': ' ',
    'Member privileges': ' ',
    'Notification settings': ' ',
    'Google Accounts': ' ',
    'Google Search': ' ',
    'Untitled': ' ',
    'Gmail': 'Gmail',
    'Google Calendar': 'Google Calendar',
    'Stack Overflow': 'Stack Overflow',
    'JSFiddle': 'JSFiddle'
  }
  if (titlesObj[title]) return titlesObj[title];

  if (title.startsWith('http') || title.startsWith('www.')) {
    console.log(`turning ${title} into ${getDomainName(title)}`)
    return getDomainName(title);
  }

  let name = title.split('-').reverse()[0].trim()
  if (titlesObj[name]) return titlesObj[name];

  name = title.split('-')[0].trim();
  if (titlesObj[name]) return titlesObj[name];

  return title;
}

exports.stripEmoji = stripEmoji;
exports.getDomainName = getDomainName;
exports.sanitizeTitle = sanitizeTitle;