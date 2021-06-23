const {Builder} = require('selenium-webdriver')
const path = require('path')
const assert = require('assert')

describe('hello world', () => {
  let driver
  before(async () => {
    const extensionPath = path.join(process.cwd(), 'build')
    const caps = {
      timeouts: {
        script: 60000,
      },
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
    await new Promise(r => setTimeout(r, 99999))
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
  it('eyes.open', async () => {
    const result = await driver.executeScript(
      `return window.__eyes.open({appName: "blah", testName: "blah", apiKey: "${process.env.APPLITOOLS_API_KEY}", showLogs: true})`
    )
    assert.ok(result)
  })
  it('eyes.close', async () => {
    const eyesId = await driver.executeScript(
      `return window.__eyes.open({appName: "blah", testName: "blah", apiKey: "${process.env.APPLITOOLS_API_KEY}", showLogs: true})`
    )
    const result = await driver.executeScript(
      `return window.__eyes.close({eyesId: '${eyesId}', throwException: false})`
    )
    assert.ok(result)
  })
  it('eyes.abort', async () => {
    const eyesId = await driver.executeScript(
      `return window.__eyes.open({appName: "blah", testName: "blah", apiKey: "${process.env.APPLITOOLS_API_KEY}", showLogs: true})`
    )
    const result = await driver.executeScript(
      `return window.__eyes.abort({eyesId: '${eyesId}'})`
    )
    assert.ok(result)
  })
  it.skip('eyes.check window (viewport)', async () => {})
  it.skip('eyes.check window (full page)', async () => {
    const eyesId = await driver.executeScript(
      `return window.__eyes.open({appName: "blah", testName: "blah", apiKey: "${process.env.APPLITOOLS_API_KEY}", showLogs: true})`
    )
    //await new Promise(res => setTimeout(res, 20000))
    await driver.executeScript(
      `return window.__eyes.check({eyesId: '${eyesId}', checkSettings: {target: 'window', fully: true}})`
    )
    const result = await driver.executeScript(
      `return window.__eyes.close({eyesId: '${eyesId}', throwException: false})`
    )
    assert.ok(result)
  })
  it.skip('eyes.check window (element)', async () => {})
  it.skip('eyes.check window (element fully)', async () => {})
  it.skip('eyes.close w/ throw exception', async () => {})
})
