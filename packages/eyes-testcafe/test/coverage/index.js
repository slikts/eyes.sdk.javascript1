const {coverageTestsConfig} = require('@applitools/sdk-shared')
const fetchSync = require('sync-fetch')
const fs = require('fs')
const path = require('path')

// provide alt. test template (didn't work as cli arg)
const modifiedConfig = {...coverageTestsConfig}
modifiedConfig.template = './test/coverage/template.hbs'

// fetch overrides
fs.writeFileSync('original-overrides.js', fetchSync(modifiedConfig.overrides).text())
const overridesPath = path.resolve(process.cwd(), 'original-overrides.js')
// modify overrides
const overrides = require(overridesPath)
// eslint-disable-next-line -- fromEntries is only >= Node 12
const filteredOverrides = Object.fromEntries(
  Object.entries(overrides).filter(
    ([_key, value]) => !(value.config && value.config.branchName === 'no-fully-by-default'),
  ),
)
fs.writeFileSync('overrides.js', `module.exports = ${JSON.stringify(filteredOverrides)}`)
modifiedConfig.overrides = path.resolve(process.cwd(), 'overrides.js')

module.exports = modifiedConfig
