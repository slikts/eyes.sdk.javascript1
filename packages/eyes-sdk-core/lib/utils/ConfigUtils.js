'use strict'

const GeneralUtils = require('./GeneralUtils')
const Logger = require('../logging/Logger')

function getConfig({
  configParams = [],
  configPath,
  logger = new Logger(!!process.env.APPLITOOLS_SHOW_LOGS),
} = {}) {
  let defaultConfig = {}
  try {
    const fullConfigPath = configPath ? `${configPath}/applitools.config.js` : undefined
    const envConfigPath = GeneralUtils.getEnvValue('CONFIG_PATH')
    /* eslint-disable node/no-missing-require */
    const result = require(envConfigPath ||
      fullConfigPath ||
      require.resolve('./applitools.config.js', {paths: [process.cwd()]}))

    if (result) {
      logger.log('Loading configuration from', configPath)
      defaultConfig = result
    }
  } catch (ex) {
    logger.log(`An error occurred while loading configuration. configPath=${configPath}\n`, ex)
  }

  const envConfig = {}
  for (const p of configParams) {
    envConfig[p] = GeneralUtils.getEnvValue(toEnvVarName(p))
    if (envConfig[p] === 'true') {
      envConfig[p] = true
    } else if (envConfig[p] === 'false') {
      envConfig[p] = false
    }
  }

  Object.keys(envConfig).forEach(value => {
    if (envConfig[value] === undefined) {
      delete envConfig[value]
    }
  })

  return Object.assign({}, defaultConfig, envConfig)
}

/**
 * @param {string} camelCaseStr
 * @return {string}
 */
function toEnvVarName(camelCaseStr) {
  return camelCaseStr.replace(/(.)([A-Z])/g, '$1_$2').toUpperCase()
}

module.exports = {
  getConfig,
  toEnvVarName,
}
