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
  this.Cypress = {
    Commands: {add: (name, func) => (calls[name] = func)},
    config: () => {},
    log: () => {},
    config: () => {},
  };
  this.cy = {
    _viewport: {called: false, callCount: 0},
    async viewport(...args) {
      this._viewport.called = true;
      this._viewport.args = args;
      this._viewport.callCount++;
      return Promise.resolve(...args);
    },
  };

  this.window = {};
  this.navigator = {};
  override(this.navigator, 'get', 'userAgent');
  override(this.window, 'get', 'fetch');

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
      expect(context.cy._viewport.called).to.be.true;
      expect(context.cy._viewport.args).to.deep.equal([800, 600]);
    });

    it('should access userAgent on global navigator', async () => {
      eyesOpen.call(self, {browser});
      expect(context.navigator.accessed).to.be.true;
      expect(context.navigator.accessCount).to.equal(1);
    });

    it('should access fetch on global window', async () => {
      eyesOpen.call(self, {browser});
      expect(context.window.accessed).to.be.true;
      expect(context.window.accessCount).to.equal(1);
    });
  });
});
