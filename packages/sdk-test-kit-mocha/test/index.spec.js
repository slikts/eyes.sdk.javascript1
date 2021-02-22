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
    it('works for without tags', () => {
      assert(testFilter.test('check region by selector after manual scroll with vg'))
    })
    it('works for tests with tags', () => {
      assert(testFilter.test('check region by native selector (@native-selectors @mobile @native)'))
    })
  })
})
