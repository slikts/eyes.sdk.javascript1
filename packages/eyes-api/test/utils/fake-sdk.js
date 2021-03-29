const assert = require('assert')
const utils = require('@applitools/utils')

function makeSDK(settings = {}) {
  settings = Object.assign({viewportSize: {width: 1000, height: 2000}}, settings)
  const history = []
  return {
    isDriver,
    isElement,
    isSelector,
    makeEyes,
    getViewportSize,
    setViewportSize,
    // closeBatch,
    // deleteTestResults,
    settings,
    history,
  }

  function isDriver(driver) {
    return Boolean(driver.isDriver)
  }

  function isElement(element) {
    return Boolean(element.isElement)
  }

  function isSelector(selector) {
    return utils.types.isString(selector) || utils.types.has(selector, ['type', 'selector'])
  }

  function makeEyes(config) {
    const test = {
      steps: []
    }

    history.push({command: 'makeEyes', data: config})

    return {open, getResults}

    function open({driver, config}) {
      assert.ok(isDriver(driver), '"driver" is not a driver')

      test.config = config
      history.push({command: 'open', data: {driver, config}})

      return {
        check,
        locate,
        extractText,
        extractTextRegions,
        close,
        abort,
      }

      function check({settings, config}) {
        test.steps.push({settings, config})
        history.push({command: 'check', data: {settings, config}})
        return {asExpected: true}
      }

      function locate({settings, config}) {
        history.push({command: 'locate', data: {settings, config}})
        return []
      }

      function extractText({regions, config}) {
        history.push({command: 'extractText', data: {regions, config}})
        return []
      }

      function extractTextRegions({settings, config}) {
        history.push({command: 'extractTextRegions', data: {settings, config}})
        return {}
      }

      function close() {
        const isDifferent = test.steps.some(step => step.settings.region && step.settings.region.includes('diff'))
        const isNew = test.steps.some(step => step.settings.region && step.settings.region.includes('new'))
        return {
          id: 'test-id',
          name: 'test',
          batchId: 'batch-id',
          batchName: 'batch-name',
          duration: 0,
          startedAt: new Date(),
          appName: 'app',
          status: isDifferent ? 'Unresolved' : 'Passed',
          isNew,
          isDifferent,
          url: 'https://eyes.applitools.com',
        }
      }

      function abort() {
        return {}
      }
    }

    function getResults() {
      return results
    }
  }

  async function getViewportSize(driver) {
    assert.ok(isDriver(driver), '"driver" is not a driver')
    history.push({command: 'getViewportSize', data: [driver], result: settings.viewportSize})
    return settings.viewportSize
  }

  async function setViewportSize(driver, viewportSize) {
    assert.ok(isDriver(driver), '"driver" is not a driver')
    assert.ok(
      utils.types.has(viewportSize, ['width', 'height']),
      '"viewportSize" must be an object with "width" and "height" properties',
    )
    settings.viewportSize = viewportSize
    history.push({command: 'setViewportSize', data: [driver, viewportSize]})
  }
}

module.exports = makeSDK
