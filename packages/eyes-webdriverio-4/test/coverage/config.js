module.exports = {
  extends: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/master/js/config.js',
  overrides: [
    'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/master/js/overrides.js',
    {
      // fails due to headfull error on gh action
      'should return actual viewport size': {skipEmit: true},
    },
  ],
}
