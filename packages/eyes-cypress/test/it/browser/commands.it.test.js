const {describe, it} = require('mocha');
const chai = require('chai');
const spies = require('chai-spies');
const expect = chai.expect;
chai.use(spies);

function override(target, method, name) {
  Object.defineProperty(target, name, {
    accessCount: 0,
    accessed: false,
    [method]: function() {
      const fakeUserAgent = `fake_${name}`;
      this.value = fakeUserAgent;
      this.accessed = true;
      this.accessCount = this.accessCount ? this.accessCount + 1 : 1;
      return fakeUserAgent;
    },
  });
}

function fakeCypress(modulePath, calls = {}) {
  const stub = {called: false, callCount: 0, args: []};
  this.state = {viewport: {...stub}, fetch: {...stub}};
  this.Cypress = {
    Commands: {add: (name, func) => (calls[name] = func)},
    config: () => {},
    log: () => {},
    config: () => {},
  };
  this.cy = {
    viewport: (...args) => {
      this.state.viewport.called = true;
      this.state.viewport.args = args;
      this.state.viewport.callCount++;
      return {then: (_args, cb) => (this.state.viewport.cb = cb)};
    },
  };

  this.window = {
    fetch: (...args) => {
      this.state.fetch.called = true;
      this.state.fetch.callCount++;
      this.state.fetch.args = args;
      return {
        then: () => ({
          json: () => {},
          then: () => 'fake',
        }),
      };
    },
  };

  this.navigator = {};
  override(this.navigator, 'get', 'userAgent');

  delete require.cache[require.resolve(modulePath)];
  require(modulePath);
  return {context: this, calls};
}

describe('commands', () => {
  describe('eyesOpen', () => {
    let context, eyesOpen, self, cypress, browser;

    beforeEach(() => {
      cypress = fakeCypress('../../../src/browser/commands');
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
      expect(context.state.fetch.called).to.be.true;
      expect(JSON.parse(context.state.fetch.args[1].body)).to.deep.equal({
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
      expect(context.state.fetch.called).to.be.true;
      expect(context.state.fetch.callCount).to.equal(1);
    });
  });
});
