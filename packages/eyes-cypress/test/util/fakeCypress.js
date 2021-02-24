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

function setFake(context, name, args) {
  context.state[name].called = true;
  context.state[name].args = args;
  context.state[name].callCount++;
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
        setFake(this, 'viewport', args);
        return {then: (_args, cb) => (this.state.viewport.cb = cb)};
      },
    };
    this.window = {
      fetch: (...args) => {
        setFake(this, 'fetch', args);
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

  override(context.navigator, 'userAgent');
  return {context, calls};
}

module.exports = fakeCypress;
