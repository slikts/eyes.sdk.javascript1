process.hrtime = require('browser-process-hrtime')
const {EyesSDK} = require('@applitools/eyes-sdk-core')
const VisualGridClient = require('@applitools/visual-grid-client')
const {version} = require('../../package.json')
const {EyesFactory: Eyes} = EyesSDK({
  name: 'eyes.browser-extension',
  version,
  spec: {},
  VisualGridClient,
})
const eyes = new Eyes()
