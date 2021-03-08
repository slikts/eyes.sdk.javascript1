const {Builder} = require('selenium-webdriver')
const path = require('path')
const assert = require('assert')

describe('hello world', () => {
  let driver
  before(async () => {
    const extensionPath = path.join(process.cwd(), 'build')
    const caps = {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: [
          `--load-extension=${extensionPath}`
        ]
      }
    }
    driver = await new Builder().withCapabilities(caps).build()
    await driver.get('https://google.com')
  })
  after(async () => {
    await driver.quit()
  })
  it('works', async () => {
    const result = await driver.executeScript('return window.__eyes.ping()')
    assert.deepStrictEqual(result, 'pong')
  })
  it('works w/ embedded eval', async () => {
    const result = await driver.executeScript('return window.__eyes.executeScript("return 9001")')
    assert.deepStrictEqual(result, 9001)
  })
  it('works w/ embedded eval w/ args', async () => {
    const result = await driver.executeScript('return window.__eyes.executeScript("return arguments[0]", [9001])')
    assert.deepStrictEqual(result, 9001)
  })
  it('works w/ embedded eval invoked from background script', async () => {
    const result = await driver.executeScript('return window.__eyes.executeScriptRoundTrip("return arguments[0]", [9001])')
    assert.deepStrictEqual(result, 9001)
  })
  it.skip('eyes.open', async () => {
    const result = await driver.executeScript('return window.__eyes.open({appName: "blah", testName: "blah"})')
    console.log(result)
  })
})
