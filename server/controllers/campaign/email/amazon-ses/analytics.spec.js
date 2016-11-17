const { expect } = require('chai');

const { insertTrackingPixel, insertUnsubscribeLink, wrapLink } = require('./analytics');


describe('amazon-ses analytics', () => {
  describe('wrapLink', () => {
    const body = '\ndear whoever,\nthis is a plaintext email body\ncheers.';
    const trackingId = 'd9ba38b2-7b52-449f-946c-7dfb7c97a3f3';
    const whiteLabelUrl = 'http://localhost:8080'

    it('wraps a plain into a clickthrough url in html emails', () => {
      const linkToWrap = '{this is a link/https://google.com}';
      const expectedBody = body + '\n<a href="http://localhost:8080/clickthrough?url=https://google.com&trackingId=d9ba38b2-7b52-449f-946c-7dfb7c97a3f3">this is a link</a>';

      expect(wrapLink(body + '\n' + linkToWrap, trackingId, 'Html', whiteLabelUrl)).to.be.equal(expectedBody);
    })

    it('returns the original body if the email is plaintext', () => {
      expect(wrapLink(body, trackingId, 'Plaintext')).to.be.equal(body);
    })

    it('uses the given white label url', () => {
      const linkToWrap = '{this is a link/https://google.com}';
      const expectedBody = body + '\n<a href="https://reddit.com/clickthrough?url=https://google.com&trackingId=d9ba38b2-7b52-449f-946c-7dfb7c97a3f3">this is a link</a>';

      expect(wrapLink(body + '\n' + linkToWrap, trackingId, 'Html', 'https://reddit.com')).to.be.equal(expectedBody);
    })
  })


  describe('insertUnsubscribeLink', () => {
    const body = '\ndear whoever,\nthis is a plaintext email body\ncheers.';
    const unsubscribeLink = 'd9ba38b2-7b52-449f-946c-7dfb7c97a3f3';
    const whiteLabelUrl = 'http://localhost:8080';
    const emailAddress = 'someone@somewhere.com';

    xit('inserts an unsubscribe link at the end of a html email', () => {
      const expectedBody = body + '\n<a href="http://localhost:8080/unsubscribe/d9ba38b2-7b52-449f-946c-7dfb7c97a3f3">unsubscribe</a>';
      expect(insertUnsubscribeLink(body, unsubscribeLink, 'Html')).to.be.equal(expectedBody);
    })

    it('inserts an unsubscribe url at the end of a plaintext email', () => {
      const expectedBody = body + `\n\n\n\n\nIf this email bothers you, you can manage your email settings here: https://www.freecodecamp.com/settings\n\nOr you can one-click unsubscribe: https://www.freecodecamp.com/unsubscribe/someone@somewhere.com`;
      expect(insertUnsubscribeLink(body, emailAddress, 'Plaintext', whiteLabelUrl)).to.be.equal(expectedBody);
    })

    xit('uses the given white label url', () => {
      let expectedBody = body + '\nhttp://google.com/unsubscribe/d9ba38b2-7b52-449f-946c-7dfb7c97a3f3';
      expect(insertUnsubscribeLink(body, unsubscribeLink, 'Plaintext', 'http://google.com')).to.be.equal(expectedBody);

      expectedBody = body + '\nhttps://reddit.com/unsubscribe/d9ba38b2-7b52-449f-946c-7dfb7c97a3f3';
      expect(insertUnsubscribeLink(body, unsubscribeLink, 'Plaintext', 'https://reddit.com')).to.be.equal(expectedBody);
      expect(insertUnsubscribeLink(body, unsubscribeLink, 'Plaintext')).to.be.equal(expectedBody);
      expect(insertUnsubscribeLink(body, emailAddress, 'Plaintext')).to.be.equal(expectedBody);
    })
  })

  describe('insertTrackingPixel', () => {
    const body = '\ndear whoever,\nthis is a plaintext email body\ncheers.';
    const trackingId = 'd9ba38b2-7b52-449f-946c-7dfb7c97a3f3';

    it('does not add a tracking pixel to a plaintext email', () => {
      expect(insertTrackingPixel(body, trackingId, 'Plaintext')).to.equal(body);
    })

    it('adds a tracking pixel img tag to the end of a html email', () => {
      const expectedImgTag = '<img src="http://localhost:8080/trackopen?trackingId=d9ba38b2-7b52-449f-946c-7dfb7c97a3f3" style="display:none">'
      const expectedBody = body + '\n' +  expectedImgTag;

      expect(insertTrackingPixel(body, trackingId, 'Html')).to.be.equal(expectedBody);
    })
  })
})
