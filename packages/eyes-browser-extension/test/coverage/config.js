module.exports = {
  extends: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/master/js/config.js',
  emitter: './test/coverage/emitter.js',
  overrides: [
    'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/master/js/overrides.js',
    {
      'check region by selector with vg classic': {},
      'check frame after manual switch to frame with vg classic': {},
    },
  ],
}
