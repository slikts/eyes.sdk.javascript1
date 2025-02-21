'use strict'

const assert = require('assert')
const assertRejects = require('assert-rejects')
const {startFakeEyesServer} = require('@applitools/sdk-fake-eyes-server')
const {MockDriver} = require('@applitools/driver')
const {EyesClassic} = require('../utils/FakeSDK')
const {generateScreenshot} = require('../utils/FakeScreenshot')

describe('EyesClassic', () => {
  let server, serverUrl, driver, eyes

  before(async () => {
    driver = new MockDriver()
    driver.takeScreenshot = generateScreenshot
    eyes = new EyesClassic()
    server = await startFakeEyesServer({logger: {log: () => {}}, matchMode: 'always'})
    serverUrl = `http://localhost:${server.port}`
    eyes.setServerUrl(serverUrl)
  })

  after(async () => {
    await server.close()
  })

  describe('#close()', () => {
    it('should throw if an internal exception happened during close(false)', async () => {
      eyes._serverConnector.stopSession = () => Promise.reject('some error')
      eyes.setMatchTimeout(0)
      await eyes.open(driver, 'FakeApp', 'FakeTest')
      await eyes.check()
      await assertRejects(eyes.close(false), /^some error$/)
    })
  })

  describe('should work wait before viewport screenshot after setWaitBeforeScreenshots', () => {
    let checkTimestamp, networkTimestamp, duration, eyes

    const thrownScreenshotDone = Symbol()
    before(async () => {
      eyes = new Proxy(new EyesClassic(), {
        get(target, key, receiver) {
          if (key === 'checkWindowBase') {
            checkTimestamp = Date.now()
          } else if (key === '_ensureRunningSession') {
            networkTimestamp = Date.now()
          } else if (key === 'getScreenshot') {
            const screenshotTimestamp = Date.now()
            duration = screenshotTimestamp - checkTimestamp - (screenshotTimestamp - networkTimestamp)
            throw thrownScreenshotDone
          }
          return Reflect.get(target, key, receiver)
        },
      })
      await eyes.open(driver, 'FakeApp', 'FakeTest')
    })

    afterEach(() => {
      eyes._configuration.setWaitBeforeScreenshots(undefined)
    })

    it('should wait default amount of time', async () => {
      const delay = eyes._configuration.getWaitBeforeScreenshots()
      try {
        await eyes.check()
      } catch (caught) {
        if (caught === thrownScreenshotDone) {
          assert(duration >= delay && duration <= delay + 10)
        } else {
          assert.fail()
        }
      }
    })

    it('should wait specified amount of time', async () => {
      const delay = 500
      try {
        eyes._configuration.setWaitBeforeScreenshots(delay)
        await eyes.check()
      } catch (caught) {
        if (caught === thrownScreenshotDone) {
          assert(duration >= delay && duration <= delay + 10)
        } else {
          assert.fail()
        }
      }
    })

    it('should wait default amount of time set null', async () => {
      const delay = eyes._configuration.getWaitBeforeScreenshots()
      try {
        eyes._configuration.setWaitBeforeScreenshots(null)
        await eyes.check()
      } catch (caught) {
        if (caught === thrownScreenshotDone) {
          assert(duration >= delay && duration <= delay + 10)
        } else {
          assert.fail()
        }
      }
    })
  })
})
