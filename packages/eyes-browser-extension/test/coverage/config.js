let i = 0

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
    },
    test => {
      const is = [
        'should send ignore regions by selector with scroll stitching',
        'should send ignore regions by selector with css stitching',
        'should send ignore region by coordinates with scroll stitching',
        'should send ignore region by coordinates with css stitching',
        'should send ignore region by coordinates in target region with scroll stitching',
        'should send ignore region by coordinates in target region with css stitching',
        'should send ignore displacements',
        'should send floating region by selector with scroll stitching',
        'should send floating region by selector with css stitching',
        'should send floating region by coordinates with scroll stitching',
        'should send floating region by coordinates with css stitching',
        'check regions by coordinates in frame with css stitching',
        'check regions by coordinates in overflowed frame with css stitching',
        'check regions by coordinates in frame with scroll stitching',
        'check regions by coordinates in overflowed frame with scroll stitching',
        'should hide and restore scrollbars with scroll stitching',
        'should hide and restore scrollbars with css stitching',
        'should send accessibility regions by selector with scroll stitching',
        'should send accessibility regions by selector with css stitching',
        'check window with layout breakpoints',
        'check window with layout breakpoints in config',
        'should not check if disabled',
        'should extract text regions from image',
        'check window with scroll stitching',
        'check window with css stitching',
        'check window fully with html scrollRootElement after scroll with css stitching',
        'check window on page with sticky header with scroll stitching',
        'check window on page with sticky header with css stitching',
        'check window fully with scroll stitching',
        'check window fully with html scrollRootElement after scroll when fail to scroll with scroll stitching',
        'check window fully with html scrollRootElement after scroll when fail to scroll with css stitching',
        'check window fully with fixed scroll root element',
        'check window fully with custom scroll root with css stitching',
        'check window fully on page with sticky header with css stitching',
        'check window fully and frame in frame fully with scroll stitching',
        'check window fully with css stitching',
        'check region by selector in frame multiple times with scroll stitching',
        'check region by selector in frame multiple times with css stitching',
        'check window fully and frame in frame fully with css stitching',
        'check window fully on page with burger menu',
        'check window after manual scroll with scroll stitching',
        'check window after manual scroll with css stitching',
        'check scrollable modal region by selector fully with scroll stitching',
        'check scrollable modal region by selector fully with css stitching',
        'check region by selector in overflowed frame fully with scroll stitching',
        'check region by selector in overflowed frame fully with css stitching',
        'check region by selector in frame fully with css stitching',
        'check region by selector on page with sticky header with css stitching',
        'check region by selector on page with sticky header with scroll stitching',
        'check region by selector in frame fully with scroll stitching',
        'check region by coordinates with scroll stitching',
        'check region by coordinates in frame fully with scroll stitching',
        'check region by coordinates with css stitching',
        'check modal region by selector fully with scroll stitching',
        'check modal region by selector fully with css stitching',
        'check modal region by selector with css stitching',
        'check modal region by selector with scroll stitching',
        'check frame fully with scroll stitching',
        'check frame with scroll stitching',
      ].includes(test.name)
      if (is) return {skipEmit: true}
    },
    {
      // not possible because of browser api
      'should not fail if scroll root is stale': {skipEmit: true},
      'should return test results from close with failed classic test': {skipEmit: true}, // no data classes
      'should return test results from close with failed vg test': {skipEmit: true}, // no data classes
      'should return test results from close with passed classic test': {skipEmit: true}, // no data classes
      'should return test results from close with passed vg test': {skipEmit: true}, // no data classes
      // not possible because of core api
      'should throw if no checkpoints before close': {skipEmit: true},
      'should return actual viewport size': {skipEmit: true}, // no data classes
    }
  ],
  emitOnly: test => {
    if (test.api === 'classic') return false
    if (!test.name.startsWith('check')) return false
    if (++i > 35) return false
    return true
  },
}
