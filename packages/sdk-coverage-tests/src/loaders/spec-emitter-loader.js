const {isUrl, requireUrl} = require('../common-util')

async function loadSpecEmitter(path) {
  return isUrl(path) ? requireUrl(path) : require(path)
}

async function specEmitterLoader({emitter: emitterPath, initializeSdk}) {
  if (initializeSdk) return initializeSdk
  return loadSpecEmitter(emitterPath)
}

exports.loadSpecEmitter = loadSpecEmitter
exports.specEmitterLoader = specEmitterLoader
