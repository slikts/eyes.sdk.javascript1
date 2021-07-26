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

  it('take full region screenshot', () => {
    return fullRegion({scrollingMode: 'scroll'})
  })

  it('take element screenshot', () => {
    return element({scrollingMode: 'scroll'})
  })

  it('take full element screenshot', () => {
    return fullElement({scrollingMode: 'scroll'})
  })

  async function viewport(options) {
    const screenshot = await screenshoter({logger, driver, ...options})
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/app.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function fullApp(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      fully: true,
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/app-fully.png').toObject()
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
    const expected = await makeImage('./test/fixtures/screenshoter/region.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function fullRegion(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      target: {x: 30, y: 500, height: 700, width: 200},
      fully: true,
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/region-fully.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function element(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      target: '#overflowing-div-image',
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/element.png').toObject()
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
