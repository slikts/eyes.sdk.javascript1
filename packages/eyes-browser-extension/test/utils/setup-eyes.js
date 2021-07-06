function setupEyes({driver, vg, ...config} = {}) {
  return {
    constructor: {
      async setViewportSize(_driver, size) {
        return driver.evaluate(size => __applitools.setViewportSize({size}), size)
      },
    },
    runner: {
      getAllTestResults(throwErr) {
        // return driver.evaluate(() => __applitools.)
      }
    },
    async open(_driver, appName, testName, viewportSize) {
      return driver.evaluate(async options => window.__eyes = await __applitools.makeEyes(options), {
        type: vg ? 'vg' : 'classic',
        concurrency: 10,
        config: {
          apiKey: process.env.APPLITOOLS_API_KEY_SDK,
          appName,
          testName,
          viewportSize,
          batch: {id: process.env.APPLITOOLS_BATCH_ID, name: process.env.APPLITOOLS_BATCH_NAME || 'JS Coverage Tests'},
          parentBranchName: 'master',
          branchName: 'master',
          dontCloseBatches: true,
          matchTimeout: 0,
          saveNewTests: false,
          ...config,
        },
      })
    },
    async check(settings) {
      return driver.evaluate(settings => __eyes.check({settings}), settings)
    },
    async locate(settings) {
      return driver.evaluate(settings => __eyes.locate({settings}), settings)
    },
    async extractText(regions) {
      return driver.evaluate(regions => __eyes.extractText({regions}), regions)
    },
    async extractTextRegions(settings) {
      return driver.evaluate(settings => __eyes.extractTextRegions({settings}), settings)
    },
    async close(throwErr = true) {
      const result = await driver.evaluate(() => __eyes.close())

      if (throwErr) {
        if (result.status !== 'Passed') throw result
      }
      return result
    },
    async abort() {
      return driver.evaluate(() => __eyes.abort())
    }
  }
}

module.exports = setupEyes
