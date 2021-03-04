import {makeSDK} from '@applitools/eyes-sdk-core'
import * as spec from './spec-driver'
const VisualGridClient = require('@applitools/visual-grid-client')
const {version} = require('../package.json')

export default makeSDK({
  name: 'eyes.puppeteer',
  version,
  spec,
  VisualGridClient,
})
