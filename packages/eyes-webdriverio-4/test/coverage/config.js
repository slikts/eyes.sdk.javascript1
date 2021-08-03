module.exports = {
  extends: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/master/js/config.js',
  overrides: [
    'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/master/js/overrides.js',
    {
      // fails due to headfull error on gh action
      'should return actual viewport size': {skipEmit: true},
      // failed due to wrong region calculation in OTHER sdks
      'appium android check region with ignore region': {skipEmit: true},
      'appium android check window': {skipEmit: true},
      // failed due to changes in latest chrome release
      'check regions by coordinates in frame with vg': {skipEmit: true},
      'check regions by coordinates in frame with css stitching': {skipEmit: true},
      'check regions by coordinates in frame with scroll stitching': {skipEmit: true},
      'check regions by coordinates in overflowed frame with vg': {skipEmit: true},
      'check regions by coordinates in overflowed frame with css stitching': {skipEmit: true},
      'check regions by coordinates in overflowed frame with scroll stitching': {skipEmit: true},
      'should send dom and location when check region by selector in frame': {skipEmit: true},
      'should send region by selector in padded page': {skipEmit: true},
    },
  ],
}
