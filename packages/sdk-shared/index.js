const {getTestInfo, getDom} = require('./src/get-test-info')
const coverageTestsConfig = require('./coverage-tests/generic')

module.exports = {
  getTestInfo,
  getDom,
  testSetup: require('./src/test-setup'),
  testServerInProcess: require('./src/test-server'),
  testServer: require('./src/run-test-server'),
  processCommons: require('./src/process-commons'),
  ApiAssertions: require('./coverage-tests/util/ApiAssertions'),
  coverageTestsConfig,
}
