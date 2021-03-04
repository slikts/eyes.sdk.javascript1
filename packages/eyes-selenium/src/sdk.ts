import {makeSDK} from '@applitools/eyes-sdk-core'
import * as spec from './spec-driver.selenium4'
const VisualGridClient = require('@applitools/visual-grid-client')
const {version} = require('../package.json')

export default makeSDK({
  name: 'eyes.selenium',
  version: `${version}--${process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION}`,
  spec,
  VisualGridClient,
})
