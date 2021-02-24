const {describe, it} = require('mocha');
const chai = require('chai');
const expect = chai.expect;

function override(target, name) {
  Object.defineProperty(target, name, {
    accessCount: 0,
    accessed: false,
    get: function() {
      const fake = `fake_${name}`;
      this.value = fake;
      this.accessed = true;
      this.accessCount = this.accessCount ? this.accessCount + 1 : 1;
      return fake;
    },
  });
}

function fakeCypress(modulePath, calls = {}) {
  const fake = {called: false, callCount: 0, args: []};
  function createContext(modulePath) {
    this.state = {viewport: {...fake}, fetch: {...fake}};
    this.Cypress = {
      Commands: {add: (name, func) => (calls[name] = func)},
      config: () => {},
      log: () => {},
      config: () => {},
    };
    this.cy = {
      viewport: (...args) => {
        setFake('viewport', args);
        return {then: (_args, cb) => (this.state.viewport.cb = cb)};
      },
    };
    this.window = {
      fetch: (...args) => {
        setFake('fetch', args);
        return {
          then: () => ({
            json: () => {},
            then: () => 'fake',
          }),
        };
      },
    };
    this.navigator = {};
    delete require.cache[require.resolve(modulePath)];
    require(modulePath);
    return this;
  }
  const context = createContext(modulePath);
  function setFake(name, args) {
    context.state[name].called = true;
    context.state[name].args = args;
    context.state[name].callCount++;
  }

  override(context.navigator, 'userAgent');
  return {context, calls};
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
