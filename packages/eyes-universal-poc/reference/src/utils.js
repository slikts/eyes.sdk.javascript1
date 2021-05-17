function serializeCheckSettings(checkSettings, specDriver, refer) {
  //   const ret = {}
  //   if (specDriver.isElement(checkSettings.getTargetElement())) {
  //     ret.region = refer.ref(checkSettings.getTargetElement())
  //   }
  //   return ret
  return checkSettings
}

function serializeConfiguration(configuration, specDriver, refer) {
  // TODO
  return configuration || {}
}

module.exports = {
  serializeCheckSettings,
  serializeConfiguration,
}
