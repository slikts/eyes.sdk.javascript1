module.exports = {
  extends: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/master/js/config.js',
  env: {
    NO_SDK: true,
    SPEC_DRIVER_PATH: './test/utils/spec-driver.js',
    SETUP_EYES_PATH: './test/utils/setup-eyes.js',
  },
  overrides: [
    'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/master/js/overrides.js',
    test => {
      if (!test.vg) return {config: {branchName: 'onscreen'}}
    }
  ],
  emitOnly: test => {
    if (test.api === 'classic') return false
    return true
  },
}
