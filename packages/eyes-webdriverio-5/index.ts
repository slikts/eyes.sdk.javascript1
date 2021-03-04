if (!process.env.APPLITOOLS_WDIO_MAJOR_VERSION) {
  const {version} = require('webdriverio/package.json')
  const [major] = version.split('.', 1)
  process.env.APPLITOOLS_WDIO_MAJOR_VERSION = major
}

export * from './src/api'
