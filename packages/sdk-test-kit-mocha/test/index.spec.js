const assert = require('assert')
const {makeTestFilter} = require('../src')
const tags = [
  'headfull',
  'webdriver',
  'mobile',
  'native',
  'chrome',
  'firefox',
  'ie',
  'edge',
  'safari',
]
const testFilter = makeTestFilter(tags)

describe('index', () => {
  describe('test filter', () => {
    it('works without tags', () => {
      assert(testFilter.test('check region by selector after manual scroll with vg'))
    })
    it('works for tests with a single tag', () => {
      assert(testFilter.test('check frame after manual switch to frame with css stitching classic (@webdriver)'))
    })
    it('works for tests with multiple tags', () => {
      assert(testFilter.test('check region by native selector (@safari @mobile @native)'))
    })
    it('works for tests with multiple tags, but not all tags match', () => {
      assert(testFilter.test('check region by native selector (@native-selectors @mobile @native)'))
    })
  })
})
