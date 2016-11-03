const clickthroughHost = 'http://localhost:8080';  // placeholder

function wrapLink(body, trackingId, type, whiteLabelUrl) {
  if (type === 'Plaintext') {  // skip link tracking for plaintext for now
    return body;
  }

  body = body.replace(/\{(.+?)\/(.+?)\}/g, function(m, label, url) {

    return `<a href="${whiteLabelUrl}/clickthrough?url=${url}&trackingId=${trackingId}">${label}</a>`
  });
  return body;
}

function insertUnsubscribeLink(body, email, type) {
  const unsubscribeUrl = `If this email bothers you, you can manage your email settings here: https://www.freecodecamp.com/settings\n\nOr you can one-click unsubscribe: https://www.freecodecamp.com/unsubscribe/${email}`;

  if (type === 'Plaintext') {
    return body + '\n\n' + unsubscribeUrl;
  }

  return body;
}

function insertTrackingPixel(body, trackingId, type) {
  if (type === 'Plaintext') {
    return body;
  }

  return body +
    `\n<img src="${clickthroughHost}/trackopen?trackingId=${trackingId}" style="display:none">`
}

module.exports = {
  wrapLink,
  insertUnsubscribeLink,
  insertTrackingPixel
}
