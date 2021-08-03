const assert = require('assert')
const pixelmatch = require('pixelmatch')
const makeDriver = require('../util/driver')
const screenshoter = require('../../index')
const makeImage = require('../../src/image')

describe('screenshoter ios', () => {
  const logger = {log: () => null, verbose: () => null}
  let driver, destroyDriver

  beforeEach(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'ios'})
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

  it('take full app screenshot (table view)', () => {
    return fullAppTableView()
  })

  it('take full app screenshot (collection view)', () => {
    return fullAppCollectionView()
  })

  it('take region screenshot', () => {
    return region()
  })

  it.skip('take full region screenshot', () => {
    return fullRegion()
  })

  it('take element screenshot', () => {
    return element()
  })

  it('take full element screenshot', () => {
    return fullElement()
  })

  async function viewport(options) {
    const screenshot = await screenshoter({logger, driver, debug: {path: './'}, ...options})
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/ios/app.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function fullAppScrollView(options) {
    const button = await driver.element({type: 'accessibility id', selector: 'Scroll view'})
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
    const expected = await makeImage('./test/fixtures/ios/app-fully.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function fullAppTableView(options) {
    const button = await driver.element({type: 'accessibility id', selector: 'Table view'})
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
    const expected = await makeImage('./test/fixtures/ios/app-fully-table.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function fullAppCollectionView(options) {
    const button = await driver.element({type: 'accessibility id', selector: 'Collection view'})
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
    const expected = await makeImage('./test/fixtures/ios/app-fully-collection.png').toObject()
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
    const expected = await makeImage('./test/fixtures/ios/region.png').toObject()
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
    const expected = await makeImage('./test/fixtures/ios/region-fully.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function element(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      target: {type: 'accessibility id', selector: 'Table view'},
      scrollingMode: 'scroll',
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/ios/element.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function fullElement(options) {
    const button = await driver.element({
      type: 'accessibility id',
      selector: 'Scroll view with nested table',
    })
    await button.click()

    const screenshot = await screenshoter({
      logger,
      driver,
      target: {type: 'xpath', selector: '//XCUIElementTypeTable[1]'},
      fully: true,
      scrollingMode: 'scroll',
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/ios/element-fully.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
})
