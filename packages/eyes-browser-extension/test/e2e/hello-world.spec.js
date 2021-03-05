const {Builder} = require('selenium-webdriver')
const path = require('path')
const assert = require('assert')

describe('hello world', () => {
  let driver
  before(async () => {
    const extensionPath = path.join(process.cwd(), 'build')
    console.log(extensionPath)
    const caps = {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: [
          `--load-extension=${extensionPath}`
        ]
      }
    }
    driver = await new Builder().withCapabilities(caps).build()
  })
  after(async () => {
    await driver.quit()
  })
  it('works', async () => {
    await driver.get('https://google.com')
    const result = await driver.executeScript('return window.__eyes.ping()')
    assert.deepStrictEqual(result, 'pong')
  })
})
