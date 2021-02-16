const {Configuration} = require('@applitools/eyes-sdk-core')

module.exports = args => {
  const configArgs = {
    ...args,
  }
  configArgs.concurrentSessions = configArgs.concurrency
  configArgs.browsersInfo = configArgs.browser
  configArgs.environmentName = configArgs.envName
  configArgs.batch = {
    id: configArgs.batchId,
    name: configArgs.batchName,
    notifyOnCompletion: configArgs.notifyOnCompletion,
  }
  delete configArgs.browser
  delete configArgs.envName
  const config = new Configuration(configArgs)
  if (args.matchLevel) config.setMatchLevel(args.matchLevel)
  if (args.ignoreDisplacements) config.setIgnoreDisplacements(args.ignoreDisplacements)
  if (args.accessibilityValidation) config.setAccessibilityValidation(args.accessibilityValidation)
  config.failTestcafeOnDiff = args.failTestcafeOnDiff
  config.tapDirPath = args.tapDirPath
  return config
}
