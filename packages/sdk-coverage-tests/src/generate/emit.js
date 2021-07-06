const {useEmitter} = require('../emitter')
const {isFunction} = require('../common-util')

function emitTests(tests, options) {
  const emittedTests = []
  const errors = []
  for (const test of tests) {
    try {
      emittedTests.push(emitTest(test, options))
    } catch (error) {
      errors.push({test, error})
    }
  }
  return {emittedTests, errors}
}

function emitTest(test, {makeSpecEmitter, makeFile}) {
  if (!isFunction(test.test)) {
    throw new Error(`Missing implementation for test ${test.name}`)
  }
  test.config.baselineName = test.config.baselineName || test.key
  test.meta = {features: test.features}
  if (test.env) {
    test.meta.browser = test.env.browser
    test.meta.mobile = Boolean(test.env.device)
    test.meta.native = Boolean(test.env.device && !test.env.browser)
    test.meta.headfull = test.env.headless === false
  }
  test.tags = Object.entries(test.meta).reduce((tags, [name, value]) => {
    if (Array.isArray(value)) tags.push(...value)
    else if (typeof value === 'string') tags.push(value.replace(/-[\d.]+$/, ''))
    else if (value) tags.push(name)
    return tags
  }, [])

  const [output, emitter, utils] = useEmitter()
  const sdk = makeSpecEmitter(emitter, test)
  test.output = output
  if (test.page) sdk.driver.visit(test.page)
  test.test.call(utils, sdk)
  test.code = makeFile(test)
  return test
}

module.exports = {emitTests, emitTest}
