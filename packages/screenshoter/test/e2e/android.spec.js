const assert = require('assert')
const pixelmatch = require('pixelmatch')
const makeDriver = require('../util/driver')
const screenshoter = require('../../index')
const makeImage = require('../../src/image')

describe('screenshoter', () => {
  const logger = {log: () => null, verbose: () => null}
  let driver, destroyDriver

  describe('android app', () => {
    beforeEach(async () => {
      ;[driver, destroyDriver] = await makeDriver({type: 'android'})
      await driver.init()
    })

    afterEach(async () => {
      await destroyDriver()
    })

    it('take viewport screenshot', () => {
      return viewport()
    })

    it('take full app screenshot (scroll view)', () => {
      return fullAppScrollView()
    })

    it('take full app screenshot (recycler view)', () => {
      return fullAppRecyclerView()
    })

    it('take region screenshot', () => {
      region()
    })

    it.skip('take full region screenshot', () => {
      return fullRegion()
    })

    it('take element screenshot', () => {
      return element()
    })
  })

  describe('androidx app', () => {
    beforeEach(async () => {
      ;[driver, destroyDriver] = await makeDriver({type: 'androidx'})
      await driver.init()
    })

    afterEach(async () => {
      await destroyDriver()
    })

    it('take full element screenshot', () => {
      return fullElement()
    })
  })

  async function viewport(options) {
    const screenshot = await screenshoter({logger, driver, ...options})
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/android/app.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function fullAppScrollView(options) {
    const button = await driver.element({type: 'id', selector: 'btn_scroll_view_footer_header'})
    await button.click()

    const screenshot = await screenshoter({
      logger,
      driver,
      fully: true,
      framed: true,
      scrollingMode: 'scroll',
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/android/app-fully.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function fullAppRecyclerView(options) {
    const button = await driver.element({type: 'id', selector: 'btn_recycler_view'})
    await button.click()

    const screenshot = await screenshoter({
      logger,
      driver,
      fully: true,
      framed: true,
      scrollingMode: 'scroll',
      debug: {path: './'},
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/android/app-fully-recycler.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function region(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      target: {x: 30, y: 500, height: 100, width: 200},
      scrollingMode: 'scroll',
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/android/region.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function fullRegion(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      target: {x: 30, y: 10, height: 700, width: 200},
      fully: true,
      scrollingMode: 'scroll',
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/android/region-fully.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function element(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      target: {type: 'id', selector: 'btn_recycler_view'},
      scrollingMode: 'scroll',
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/android/element.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function fullElement(options) {
    const button = await driver.element({
      type: 'id',
      selector: 'btn_recycler_view_in_scroll_view_activity',
    })
    await button.click()

    const screenshot = await screenshoter({
      logger,
      driver,
      target: {type: 'id', selector: 'recyclerView'},
      fully: true,
      scrollingMode: 'scroll',
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/android/element-fully.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
})
