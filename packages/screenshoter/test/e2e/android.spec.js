const assert = require('assert')
const pixelmatch = require('pixelmatch')
const makeDriver = require('../util/driver')
const screenshoter = require('../../index')
const makeImage = require('../../src/image')

describe('screenshoter', () => {
  const logger = {log: () => null, verbose: () => null}
  let driver, destroyDriver

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

  it('take full app screenshot', () => {
    return fullApp({scrollingMode: 'scroll'})
  })

  it('take region screenshot', () => {
    region({scrollingMode: 'scroll'})
  })

  it.skip('take full region screenshot', () => {
    return fullRegion({scrollingMode: 'scroll'})
  })

  it('take element screenshot', () => {
    return element({scrollingMode: 'scroll'})
  })

  it.skip('take full element screenshot', () => {
    return fullElement({scrollingMode: 'scroll'})
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
  async function fullApp(options) {
    const button = await driver.element({type: 'id', selector: 'btn_recycler_view'})
    await driver.target.$(button.target).then(button => button.click())

    const screenshot = await screenshoter({
      logger,
      driver,
      fully: true,
      framed: true,
      debug: {path: './'},
      ...options,
    })
    const actual = await screenshot.image.toFile('./test/fixtures/android/app-fully2.png')
    const expected = await makeImage('./test/fixtures/android/app-fully.png').toObject()
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
      debug: {path: './'},
      ...options,
    })
    const actual = await screenshot.image.toFile('./test/fixtures/android/region-fully.png')
    // const expected = await makeImage('./test/fixtures/android/region.png').toObject()
    // assert.strictEqual(
    //   pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
    //   0,
    // )
  }
  async function element(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      target: {type: 'id', selector: 'btn_recycler_view'},
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
    const screenshot = await screenshoter({
      logger,
      driver,
      target: '#overflowing-div-image',
      fully: true,
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/element-fully.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
})
