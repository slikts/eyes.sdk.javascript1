import {makeSDK} from '@applitools/eyes-sdk-core'
import * as spec from './spec-driver'
import {version} from '../package.json'
const VisualGridClient = require('@applitools/visual-grid-client')

export default makeSDK({
  name: 'eyes.playwright',
  version,
  spec,
  VisualGridClient,
})
