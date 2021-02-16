const path = require('path')

function configLoader({config: configPath}) {
  const config = require(path.join(path.resolve('.'), configPath))

  if (config.outPath || config.output) {
    config.outDir = config.outPath || config.output
  }
  if (config.metaPath) {
    config.metaDir = config.metaPath
  }
  if (config.resultPath) {
    config.resultDir = config.resultPath
  }

  return config
}

exports.configLoader = configLoader
