import {makeSDK} from '@applitools/eyes-sdk-core'
const VisualGridClient = require('@applitools/visual-grid-client')
const spec = require('./spec-driver')
const {version} = require('../package.json')

export default makeSDK({
  name: 'eyes.playwright',
  version,
  spec,
  VisualGridClient,
})
