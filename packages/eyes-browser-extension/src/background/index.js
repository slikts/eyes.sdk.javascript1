process.hrtime = require('browser-process-hrtime')
const {EyesSDK} = require('@applitools/eyes-sdk-core')
const VisualGridClient = require('@applitools/visual-grid-client')
console.log(EyesSDK)
console.log(VisualGridClient)
window.__eyes = EyesSDK
