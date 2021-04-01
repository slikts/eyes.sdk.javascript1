const convert = require('xml-js')
const {logDebug} = require('../log')

function convertJunitXmlToResultSchema({junit, browser, metadata}) {
  const tests = parseJunitXmlForTests(junit)
  logDebug(tests)
  return tests
    .map(testResults => {
      const testName = parseBareTestName(testResults._attributes.name)
      const testMeta = metadata[testName] || {name: testName, isGeneric: false}
      const isSkipped = testMeta.skip || testMeta.skipEmit || false // we explicitly set false to preserve backwards compatibility
      if (!testMeta && !isSkipped) return

      return {
        test_name: testMeta.name || testName,
        parameters: {
          browser: browser || 'chrome',
          mode: testMeta.executionMode,
          api: testMeta.api,
        },
        passed: testResults && !isSkipped ? !testResults.failure : undefined,
        isGeneric: testMeta.isGeneric,
        isSkipped,
      }
    })
    .filter(Boolean)
}

function parseBareTestName(testCaseName) {
  return testCaseName
    .replace(/Coverage Tests /, '')
    .replace(/\(.*\)/, '')
    .trim()
}

function parseJunitXmlForTests(xmlResult) {
  const jsonResult = JSON.parse(convert.xml2json(xmlResult, {compact: true, spaces: 2}))
  if (jsonResult.hasOwnProperty('testsuites')) {
    const testsuite = jsonResult.testsuites.testsuite
    return Array.isArray(testsuite)
      ? testsuite
          .map(suite => suite.testcase)
          .reduce((flatten, testcase) => flatten.concat(testcase), [])
      : Array.isArray(testsuite.testcase)
      ? testsuite.testcase
      : [testsuite.testcase]
  } else if (jsonResult.hasOwnProperty('testsuite')) {
    const testCase = jsonResult.testsuite.testcase
    return testCase.hasOwnProperty('_attributes') ? [testCase] : testCase
  } else throw new Error('Unsupported XML format provided')
}

module.exports = {
  convertJunitXmlToResultSchema,
  parseBareTestName,
  parseJunitXmlForTests,
}
