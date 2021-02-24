const {describe, it} = require('mocha');
const fakeCypress = require('../../util/fakeCypress');
const chai = require('chai');
const expect = chai.expect;
const path = require('path');

describe('commands', () => {
  describe('eyesOpen', () => {
    let context, eyesOpen, self, cypress, browser;

    beforeEach(() => {
      cypress = fakeCypress(path.resolve(__dirname, '../../../src/browser/commands'));
      context = cypress.context;
      browser = {width: 800, height: 600};
      eyesOpen = cypress.calls['eyesOpen'];
      self = {
        currentTest: {
          title: 'test',
        },
      };
    });

    it('should call handleViewport with correct viewport', async () => {
      eyesOpen.call(self, {browser});
      expect(context.state.viewport.called).to.be.true;
      expect(context.state.viewport.args).to.deep.equal([800, 600]);
    });

    it('should validate args to sendRequest', async () => {
      eyesOpen.call(self, {browser});
      context.state.viewport.cb();
      const [, args] = context.state.fetch.args;
      expect(context.state.fetch.called).to.be.true;
      expect(JSON.parse(args.body)).to.deep.equal({
        testName: 'test',
        browser: {width: 800, height: 600, name: 'chrome'},
        userAgent: 'fake_userAgent',
      });
    });

    it('should access userAgent on global navigator', async () => {
      eyesOpen.call(self, {browser});
      expect(context.navigator.accessed).to.be.true;
      expect(context.navigator.accessCount).to.equal(1);
    });

    it('should call fetch on global window', async () => {
      eyesOpen.call(self, {browser});
      context.state.viewport.cb();
      expect(context.state.fetch.called).to.be.true;
      expect(context.state.fetch.callCount).to.equal(1);
    });
  });
});
